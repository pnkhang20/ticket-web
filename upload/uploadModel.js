
require('dotenv').config();

const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN }
    = process.env;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

var that = module.exports = {
    setFilePublic: async(fileId) =>{
        try {
            await drive.permissions.create({
                fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            })

            const getUrl = await drive.files.get({
                fileId,
                fields: 'webViewLink, webContentLink'
            })

            return getUrl;
        } catch (error) {
            console.error(error);
        }
    },
    uploadFile: async (shared) => {
        try {
            const createFile = await drive.files.create({
                requestBody: {
                    name: shared.name,
                    mimeType: 'image/jpg'
                },
                media: {
                    mimeType: 'image/jpg',
                    body: fs.createReadStream(path.join(__dirname, shared.path))
                }
            })
            const fileId = createFile.data.id;
            console.log(createFile.data)
            const getUrl = await that.setFilePublic(fileId);

            console.log(getUrl.data);

        } catch (error) {
            console.error(error);
        }
    },
    deleteFile: async (fileId) => {
        try {
            console.log('Delete File:::', fileId);
            const deleteFile = await drive.files.delete({
                fileId: fileId
            })
            console.log(deleteFile.data, deleteFile.status)
        } catch (error) {
            console.error(error);
        }
    }
}