// postinstall.mjs

import { promises as fsPromises } from 'fs';
import path from 'path';
import inquirer from 'inquirer';

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
    // Prompt the user about GitHub Actions and necessary folders
    const answers = await inquirer.prompt([
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
    ]);

    if (answers.includeGitHubActions) {
      // Copy GitHub Action files to the project directory
      for (const { source, target } of filesToCopy) {
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
      const foldersToCreate = [
        path.join(process.cwd(), 'selectors'),
        path.join(process.cwd(), 'features'),
        path.join(process.cwd(), 'tests'),
      ];

      for (const folder of foldersToCreate) {
        await mkdir(folder, { recursive: true });
      }

      console.log('Necessary folders have been added to your project.');
    } else {
      console.log('Necessary folders were not added to your project.');
    }

    console.log('Post-installation setup completed.');
  } catch (error) {
    console.error('Error during post-installation setup:', error.message);
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
