import axios from "axios";

export default class UploadAdapter {
	constructor(loader , url) {
		this.url = url;
		this.loader = loader;
		this.loader.file.then(pic => (this.file = pic));

		this.upload();
	}

	upload() {
        if(!this.file){
            return;
        }

		const fd = new FormData();
		fd.append("image", this.file); 

		return new Promise((resolve, reject) => {
			axios
				.post(this.url, fd, {
					onUploadProgress: e => {
						console.log(Math.round((e.loaded / e.total) * 100) + " %");
					}
				})
				.then(response => {
					resolve({default: response.data.result.url});
				})
				.catch(error => {
					reject(error);
				});
		});
	}
}
