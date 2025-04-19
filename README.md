# ircnet.info

[ircnet.info](https://www.ircnet.info) is a dynamic website that interacts with different APIs to provide the following services:

| Service       | API           |
| ------------- |:-------------:| 
| Server list   | InfoBot       |
| I:Line Lookup | InfoBot       | 
| Channel list  | Clis          | 

# Setup
Install NodeJS and Angular as described [here](https://angular.io/guide/setup-local).

Clone the git repository and type `npm install` to install all dependencies.

## Development
To start a development server type `ng serve` and navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Deployment
Run `ng deploy  --cname=www.ircnet.info` to deploy the newest version to [https://www.ircnet.info](https://www.ircnet.info). It will update the sources in the `gh-pages` branch.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
