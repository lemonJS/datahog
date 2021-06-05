# Datahog

An attempt at making a resilient, asynchronous API to fetch data from flaky providers.

A couple of options were considered, and are documented [here](https://github.com/lemonJS/datahog/blob/main/docs/options.md).

### Pre-requisites
- Node.js v14.x
- Yarn
- AWS creds

### Installation
```bash
$ git clone git@github.com:lemonJS/datahog.git
$ cd datahog
$ yarn install
```

### Running the tests
```bash
$ yarn test
```

### Deploying
You will need to create the domain name in Api Gateway and Route53 the first time you deploy. It can take 40 minutes or so before it is available
```bash
$ sls create_domain
```
The API can be deployed, although you will need to replace the domain in `serverless.yml` to something you have a certificate for
```bash
$ sls deploy
```

### Directory structure
|Folder|Description|
-------|------------
|config|All of the CloudFormation configuration
|deploy|Deployment helper scripts
|docs  |Design decisions and considerations
|functions|Lambda function entry points
|lib|Shared application code
|tests|All of the tests and their helpers
|types|Common TypeScript types that are shared amonst the Api 

### Endpoints
|Method|Endpoint|Description|Schema|
-------|--------|-----------|-------
POST|`https://datahog.lemonjs.uk/collect`|Submit the provider and callback url to asynchronously fetch bill data|[json](https://github.com/lemonJS/datahog/blob/main/functions/publisher/schema.json)
GET|`https://datahog.lemonjs.uk/providers/:id`|Get bill data for a given provider|N/A

