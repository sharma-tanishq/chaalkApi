const fs = require("fs-extra");
const imageDataURI = require("image-data-uri");
const videoshow = require("videoshow");

const TimeoutTime = 30; // The time we're willing to wait before we decide the session is closed (in seconds)
const ActiveSessions = {};

const recordingsLocation = "recordings";

const videoOptions = {
	fps: 30,
	videoBitrate: 1024,
	videoCodec: "libx264",
	size: "640x?",
	format: "mp4",
	pixelFormat: "yuv420p",
};

// Fix frame sets that might've arrived out of order
const correctTemporalIntegrity = (arr) => {
	const compare = (a, b) => {
		if (a.timeOfDeparture < b.timeOfDeparture) {
			return -1;
		}
		if (a.timeOfDeparture > b.timeOfDeparture) {
			return 1;
		}
		return 0;
	};

	arr.sort(compare);
	return arr;
};

// Just extract the frames, we're done with time of departure
const objArrayToImgArray = (arr) => {
	let result = [];
	arr.forEach((elem) => {
		result = [...result, ...elem.imgArray];
	});
	return result;
};

const getCorrectFrames = (arr) => {
	return objArrayToImgArray(correctTemporalIntegrity(arr));
};

const removeItem = (array, item) => {
	let i = array.length;
	while (i--) {
		if (array[i] === item) {
			array.splice(array.indexOf(item), 1);
		}
	}
};

const makeImagesFromFrames = async (arr, path) => {
	const images = new Array(arr.length).fill(0);
	await Promise.all(
		arr.map(async (elem, index) => {
			const filePath = await imageDataURI.outputFile(
				elem,
				`${path}${index}`
			);
			images[index] = `${filePath}`;
		})
	);
	removeItem(images, 0);
	return images;
};

class SessionHanlder {
	constructor(sessionTag) {
		this.ETA = TimeoutTime;
		this.sessionTag = sessionTag;
		this.fileName = `_${sessionTag}.json`;
		this.fileDir = `${recordingsLocation}/_${sessionTag}`;
		this.fileLocation = `${this.fileDir}/${this.fileName}`;
		this.storage = [];
		this.syncing = true;

		// Make a file to work with
		fs.outputJSON(this.fileLocation, [])
			.then(() => {
				this.syncing = false;
				console.log("Made temporary work file for", this.sessionTag);
			})
			.catch((e) => console.error(e));

		// Every tick we do some job
		// like updating ETA and Syncing the file
		this.Interval = setInterval(() => {
			// Update and log ETA
			this.ETA--;
			console.log(this.sessionTag, "=>", this.ETA);

			// Sync with file if possible
			this._SyncFile()
				.then()
				.catch((e) => false);

			// Handle Timeout
			if (this.ETA < 1)
				this._TimeOut()
					.then()
					.catch((e) => false);
		}, 1000);
	}

	async _TimeOut() {
		this.syncing = true;
		clearInterval(this.Interval); // we don't need to tick anymore
		delete ActiveSessions[this.sessionTag]; // so this object's garbage collected when it's done
		console.log("Timeout for", this.sessionTag);

		const jsonState = await fs.readJson(this.fileLocation);
		const images = await makeImagesFromFrames(
			getCorrectFrames(jsonState),
			`${this.fileDir}/_${this.sessionTag}`
		);
		console.log(images);

		videoshow(images, videoOptions)
			.save(`${recordingsLocation}/O${this.sessionTag}.mp4`)
			.on("start", (command) => {
				console.log("ffmpeg process started:", command);
			})
			.on("error", async (err, stdout, stderr) => {
				console.error("Error:", err);
				console.error("ffmpeg stderr:", stderr);
				console.log("Refusing Cleanup for preservation", this.sessionTag); // declare the cleanup
			})
			.on("end", async (output) => {
				console.error("Video created in:", output);
				await fs.remove(this.fileDir); // remove the temporary files
				console.log("Cleanup for", this.sessionTag); // declare the cleanup
			});
	}

	Append(imgArray, timeOfDeparture) {
		console.log("Appending to", this.sessionTag);
		this.ETA = TimeoutTime;
		this.storage.push({ imgArray, timeOfDeparture });
	}

	async _SyncFile() {
		if (this.storage.length > 0 && !this.syncing) {
			this.syncing = true;
			const tmp = this.storage;
			this.storage = [];
			console.log("Syncing with", this.fileName);
			// Sync File Now
			const jsonState = await fs.readJson(this.fileLocation);
			await fs.outputJson(this.fileLocation, [...jsonState, ...tmp]);
			// End Syncing
			this.syncing = false;
		}
	}
}

exports.append = (req, res) => {
	res.json({}); // respond immediately, don't have anything to report and don't wanna stall
	const tag = req.body.sessionTag;
	// Make a new Session Handler for unregistered session
	if (!Object.keys(ActiveSessions).includes(tag))
		ActiveSessions[tag] = new SessionHanlder(tag);

	// Append the images along with the time of departure
	ActiveSessions[tag].Append(req.body.imgArray, req.body.timeOfDeparture);
	console.log(Object.keys(ActiveSessions));
};
