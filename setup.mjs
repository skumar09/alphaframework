// setup.js

const { promises: fsPromises } = require('fs');
const path = require('path');

const { copyFile, mkdir, readdir, access } = fsPromises;

const filesToCopy = [
  {
    source: path.join(__dirname, '.github', 'workflows', 'dailyrun.yml'),
    target: path.join(process.cwd(), '.github', 'workflows', 'dailyrun.yml'),
  },
  // Add more files to copy here if needed
];

async function copyFileIfExists(source, target) {
  try {
    await copyFile(source, target);
    console.log(`Copied ${source} to ${target}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${target}: ${error.message}`);
  }
}

async function setup() {
  try {
    // Create the necessary folders
    const foldersToCreate = [
      path.join(process.cwd(), 'selectors'),
      path.join(process.cwd(), 'features'),
      path.join(process.cwd(), 'tests'),
    ];

    for (const folder of foldersToCreate) {
      await mkdir(folder, { recursive: true });
    }

    // Copy files to the project directory
    for (const { source, target } of filesToCopy) {
      if (!(await fileExists(target))) {
        await copyFileIfExists(source, target);
      } else {
        console.log(`Skipped copying ${source} to ${target} (already exists).`);
      }
    }

    console.log('Necessary folders and files have been added to your project.');
  } catch (error) {
    console.error('Error during setup:', error.message);
  }
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

setup();
