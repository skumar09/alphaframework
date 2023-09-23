import inquirer from 'inquirer';
import { promises as fsPromises, existsSync } from 'fs';
import path from 'path';

const { copyFile, mkdir, readdir } = fsPromises;

const filesToCopy = [
  {
    source: path.join(__dirname, 'source', '.github', 'workflows', 'dailyrun.yml'),
    target: path.join(process.cwd(), '.github', 'workflows', 'dailyrun.yml'),
  },
  {
    source: path.join(__dirname, 'source', '.github', 'workflows', 'selfrun.yml'),
    target: path.join(process.cwd(), '.github', 'workflows', 'selfrun.yml'),
  },
  {
    source: path.join(__dirname, 'source', 'selectors', 'example.block.js'),
    target: path.join(process.cwd(), 'selectors', 'example.block.js'),
  },
  {
    source: path.join(__dirname, 'source', 'features', 'example.spec.js'),
    target: path.join(process.cwd(), 'features', 'example.spec.js'),
  },
  {
    source: path.join(__dirname, 'source', 'tests', 'example.test.js'),
    target: path.join(process.cwd(), 'tests', 'example.test.js'),
  },
  {
    source: path.join(__dirname, 'source', 'global.setup.js'),
    target: path.join(process.cwd(), 'global.setup.js'),
  },
  {
    source: path.join(__dirname, 'source', 'playwright.config.js'),
    target: path.join(process.cwd(), 'playwright.config.js'),
  },
];

async function copyFileIfExists(source, target) {
  try {
    await copyFile(source, target);
    console.log(`Copied ${source} to ${target}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${target}: ${error.message}`);
  }
}

// Function to check if a file exists
async function fileExists(filePath) {
  return existsSync(filePath);
}

// Function to check if a folder exists
async function folderExists(folderPath) {
  try {
    const items = await readdir(folderPath);
    return items && items.length > 0;
  } catch (error) {
    return false;
  }
}

// Prompt the user about GitHub Actions and necessary folders
inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'includeGitHubActions',
      message: 'Do you want to include GitHub Actions files?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'createFolders',
      message: 'Do you want to create the necessary folders (selectors, features, tests)?',
      default: true,
    },
  ])
  .then(async (answers) => {
    if (answers.includeGitHubActions) {
      // Copy GitHub Action files to the project directory
      for (const { source, target } of filesToCopy.slice(0, 2)) {
        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }
    } else {
      console.log('GitHub Action files were not added to your project.');
    }

    if (answers.createFolders) {
      // Create the necessary folders
      for (const { source, target } of filesToCopy.slice(2)) {
        const folderPath = path.dirname(target);

        if (!(await folderExists(folderPath))) {
          await mkdir(folderPath, { recursive: true });
        }

        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }

      // Copy global.setup.js and playwright.config.js to the root folder
      for (const { source, target } of filesToCopy.slice(5, 7)) {
        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }

      console.log('Necessary folders and files have been added to your project.');
    } else {
      console.log('Necessary folders and files were not added to your project.');
    }

    // Continue with the rest of your installation logic...
  });
