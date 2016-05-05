/*
Leaflet.RSWE building and linting scripts.

To use, install Node, then run the following commands in the project root:

    npm install -g jake
    npm install

To check the code for errors and build Leaflet from source, run "jake".
To run the tests, run "jake test".

For a custom build, open build/build.html in the browser and follow the instructions.
*/

var build = require('./build/build.js');

function hint(msg, paths) {
    return function () {
        console.log(msg);
        jake.exec('node node_modules/jshint/bin/jshint -c ' + paths,
                    {printStdout: true}, function () {
            console.log('\tCheck passed.\n');
            complete();
        });
    };
}

desc('Check Leaflet.RSWE source for errors with JSHint');
task('lint', {async: true}, hint('Checking for JS errors...', 'build/hintrc.js src'));

desc('Check Leaflet.RSWE specs source for errors with JSHint');
task('lintspec', {async: true}, hint('Checking for specs JS errors...', 'spec/spec.hintrc.js spec/suites'));

desc('Combine and compress Leaflet.RSWE source files');
task('build', {async: true}, function () {
    build.build(complete);
});

desc('Run PhantomJS tests');
task('test', ['lint', 'lintspec'], {async: true}, function () {
    build.test(complete);
});

desc('Run Google Compiler optimization');
task('GoogleCompiler', {async: true}, function(){

    var detect_java_cmd = 'java -version';
    var run_optimizer_cmd = 'java -jar ./spec/compiler.jar --js ./dist/leaflet.RSWE-src.js --js_output_file ./dist/leaflet.RSWE-min.js';

    var ex = jake.createExec(['echo Detecting Java Version: ' + detect_java_cmd], {printStdout: true, printStderr: true});
    ex.addListener('error', function (msg, code) {
        console.log('\nJava not detected... Google Compiler optimisation has been cancelled.');
    });
    ex.addListener('cmdEnd', function () {
        if ( !this.stderr) {
            console.log('\nStart Google Compiler...\n');
            jake.exec(run_optimizer_cmd, {printStdout: true, printStderr: true}, function () {
                console.log('Google Compiler successfully optimize your code.\n');
            });
        }
    });
    ex.run();
});

task('default', ['test', 'build', 'GoogleCompiler']);

jake.addListener('complete', function () {
    process.exit();
});