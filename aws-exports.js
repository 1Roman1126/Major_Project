import Amplify, { Storage } from 'aws-amplify';

Amplify.configure({
    Storage: {
        AWSS3: {
            bucket: 'nepse-stock-data', // Replace with your S3 bucket name
            region: 'us-east-1', // Replace with your region
               }
    }
});
