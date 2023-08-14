import axios from "axios";

const baseUrl = 'http://localhost:8000';

const deleteImages = (items: any[]) => {
    const url = generateUrl(baseUrl, '/image', items); 
    
    return new Promise((resolve, reject) => {
        axios.delete(url)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

const createPost = async (title: any, content: any, imageUrl: any) => {
    const jsonData = {
        title: title,
        content: content,
        imageUrl: imageUrl
    }


    return new Promise((resolve, reject) => {
        axios.post(`${baseUrl}/post`, jsonData)
            .then(response => {
                resolve(response);
                return "Ok";
            })
            .catch(error => {
                reject(error);
                return "Error";
            });
    });
}

const generateUrl = (urlBase: string, path: string, data: any[]) => {
    let count = 0;

    let url = urlBase + path;

    for (let item of data) {
        if (count === 0) {
            url += "?id=" + item;
        }
        else {
            url += "&id=" + item;
        }
        count++;
    }

    return url as string;
}

export {deleteImages as DeleteImages, createPost as CreatePost}