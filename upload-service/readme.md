3 Services to make:

1- Upload Service
2- Deployment Service
3- Request Handler Service


1. Upload Service
    github_url --> server
    server ---> github
    github ---> sends the files to server
    the files are then uploaded to s3 object

2. Deployment Service
    Build code in S3  (HTML/CSS/JS)
    Save those HTML/CSS/JS assets in S3

3. Request Handler
    Based on the url identify the assets which needs to be sent
    Retrieve them from s3 and send it to the user (cache)