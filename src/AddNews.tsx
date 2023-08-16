import { Input, Modal, Upload, message } from 'antd'
import { useState } from 'react'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { RcFile, UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload';
import axios from 'axios'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import UploadAdapter from "./api/UploadAdapter";
import {DeleteImages, CreatePost} from './api/ImageApi'

interface Props {
    isModalOpen: boolean,
    handleOk?: () => void,
    handleCancel?: () => void
}

const URL = "http://localhost:8000/image/upload";

// Custom Upload Adapter Plugin function
function CustomUploadAdapterPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
        return new UploadAdapter(loader, URL);
    };
}

const AddNews = (props: Props) => { 
    const { isModalOpen, handleCancel } = props;
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>();
    const [ckEdittorData, setCkEdittorData] = useState<string>();
    const [title, settitle] = useState('');
    const [imageArr, setImageArr] = useState<any[]>([]);

    const beforeUpload = (file: RcFile) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
        console.log(info);
    }

    const uploadImage = async (options: any) => {
        const { onSuccess, onError, file } = options;

        const fmData = new FormData();
        fmData.append("image", file);
        try {
            const res = await axios.post(URL, fmData);

            setImageUrl(res.data.result.url);
            onSuccess("Ok");
        } catch (err) {
            onError({ err });
        }
    };

    const handleChangeTitle = (event: any) => {
        settitle(event.target.value);
    }

    const extractImgSrc = (html: string) => {
        var m,
            urls = [], 
            rex = /<img[^>]+src="?([^"\s]+)"?\s*>/g;

        while (m = rex.exec(html)) {
            urls.push(m[1]);
        }

        return urls;
    }

    const handleOk = async () => {
        setLoading(true);

        const result: any = await CreatePost(title, ckEdittorData, imageUrl);
        
        if(result.status === 201){
            alert("Ok");
        }
        else{
            alert("Error");
        }

        setLoading(true);
    }

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const config = {
        language: "en", // fa - for persian language ( rtl )
        extraPlugins: [CustomUploadAdapterPlugin]
    };

    return (
        <Modal
            title="Thêm tin tức"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={1000}
        >
            <div className='flex'>
                <div className='w-2/5 h-44'>
                    <Upload
                        name="avatar"
                        listType="picture-card"
                        className="image-news h-full"
                        action={URL}
                        showUploadList={false}
                        onChange={handleChange}
                        customRequest={uploadImage}
                        beforeUpload={beforeUpload}
                        style={{ height: "100%" }}
                    >
                        {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%', height: "100%" }} /> : uploadButton}
                    </Upload>
                </div>
                <div className='w-3/5 pl-6'>
                    <Input className='w-full mb-6' placeholder='Title' value={title} onChange={handleChangeTitle}/>
                    <CKEditor id="CkEditor"
                        editor={ClassicEditor}
                        config={config}
                        data={ckEdittorData}
                        onReady={editor => {
                            console.log('Editor is ready to use!', editor);
                            editor.commands.get('undo')?.forceDisabled('CkEditor');
                            editor.keystrokes.set(
                                'Ctrl+Z',
                                (keyEvtData, cancel) => {
                                    cancel()
                                },
                                {priority: 'high'},
                            )
                            editor.keystrokes.set(
                                'Ctrl+Y',
                                (keyEvtData, cancel) => {
                                    cancel();
                                },
                                {priority: 'high'},
                            )
                        }}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setCkEdittorData(data);
                            const imgs = extractImgSrc(data);

                            if(imageArr.length < imgs.length){
                                setImageArr([...imgs]);
                            }
                            else if(imageArr.length > imgs.length){
                                let compareArr = imageArr.filter(function(obj: any) { 
                                    return imgs.indexOf(obj) == -1; 
                                });
                                
                                if(compareArr.length > 0){
                                    DeleteImages(compareArr);
                                    setImageArr([...imgs]);
                                }
                            }

                            console.log({ event, editor, data });
                        }}
                        onBlur={(event, editor) => {
                            console.log('Blur.', editor);
                        }}
                        onFocus={(event, editor) => {
                            console.log('Focus.', editor);
                        }}
                    />
                </div>
            </div>
        </Modal>
    )
}

export default AddNews