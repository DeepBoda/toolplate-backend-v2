const { exec } = require("child_process");
const os = require("os");

// Determine the correct shell to use
const isWindows = os.platform() === "win32";
const shell = isWindows ? "cmd.exe" : "sh";

// The command to run if linting passes
let startCommand = process.argv[2];

// Use npx to ensure nodemon is executed correctly
if (startCommand.startsWith("nodemon")) {
  startCommand = `npx ${startCommand}`;
}

exec("npx eslint .", { shell }, (error, stdout, stderr) => {
  if (error) {
    console.error(`ESLint errors:\n${stderr || stdout}`);
    process.exit(1);
  } else {
    console.log("No ESLint errors found. Starting the application...");
    const childProcess = exec(startCommand, { shell });
    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
  }
});
