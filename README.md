# NLPReViz: emr-vis-web

![Screenshot](https://github.com/trivedigaurav/emr-vis-web/raw/master/screenshot.png)

emr-vis-web provides the frontend view for [emr-nlp-server](https://github.com/trivedigaurav/emr-nlp-server).

## Getting Started

To get started, install the pre-requisites and then clone emr-vis-web as described below:

### Prerequisites

1. You need git to clone the emr-vis-web repository. You can get it from
[http://git-scm.com/](http://git-scm.com/).

2. You must have node.js and its package manager (npm) installed. You can download them from [http://nodejs.org/](http://nodejs.org/) or get them using your favourite package manager. For example, if you are on a Mac and have [homebrew][homebrew] installed, run `$ brew install node`.

3. We use the [Apache Tomcat](http://tomcat.apache.org/) server to deploy the app. On a Mac with [homebrew][homebrew] you may use `$ brew install tomcat` to get it.

4. We have separate repository for our backend service. Visit [emr-nlp-server](https://github.com/trivedigaurav/emr-nlp-server) for more. 

### Clone emr-vis-web

1. Navigate to the home directory of your tomcat server. You can use `$ catalina version` and find out what `CATALINA_HOME` is set to.
2. `cd` to the _webapps/_ directory. If you are using the default tomcat setup, your present working directory would be something like _/usr/local/Cellar/tomcat/7.0.54/libexec/webapps/_.
3. Clone the emr-vis-web repository into the webapps direcory using [git][git]:

    ```
    cd webapps
    git clone https://github.com/trivedigaurav/emr-vis-web.git
    cd emr-vis-web
    ```

### Install Dependencies

1. Make sure you have [node.js][node] installed. 

2. We have preconfigured `npm` to automatically run `bower` and `grunt`. So all you need to do is:

    ```
    npm install
    ```
    
    This would run the following steps:
    
    * Get the tools we depend upon via `npm` - the [node package manager][npm].
    * Download the angular code and javascript dependencies via `bower` - a [client-side code package manager][bower].
    * And set the config variables using `grunt` - a [javascript task runner][grunt].

3. (Skip this step to leave default settings as it is.) 
   In case you need to change the backend service's path, edit the `config.backend` variable in _package.json_ **or**  use the following commands:

    ```
    npm config set emr-vis-web:backend <relative/path/to/backend/service>
    npm start
    ```
    
    Valid examples of this path include _"http://localhost:9090/backEndService"_, _"/backEndService"_ etc.
    
    Editing package.json would be a permanent solution while using the `npm config` lets you include the config settings for the current terminal session.

### Run the Application

If you haven't built the backend project as yet, please do so now. Refer to the readme on  [emr-nlp-server](https://github.com/trivedigaurav/emr-nlp-server) for more information. Remember to go through step 3 to set the correct path to the backend service if you plan to modify the defaults.

Now browse to the app at `http://localhost:8080/emr-vis-web/app/index.html` or `<your-localhost-root>/emr-vis-web/app`.

## Notes

The wordtree is adapted from the library by silverasm, available at https://github.com/silverasm/wordtree. Our project depends on the javascript libraries listed in [bower.json](bower.json).

[git]: http://git-scm.com/
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[grunt]: http://gruntjs.com/
[homebrew]: http://brew.sh/

## License 
This project is released under the GPL 3 license. Take a look at the [LICENSE](LICENSE.md) file in the source for more information.
