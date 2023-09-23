import inquirer from 'inquirer';
import { promises as fsPromises } from 'fs';
import path from 'path';

const { copyFile } = fsPromises;

// Define the source paths for GitHub Actions workflow files
const githubActionsSourcePaths = {
  dailyrunYml: new URL('.github/workflows/dailyrun.yml', import.meta.url),
  selfrunYml: new URL('.github/workflows/selfrun.yml', import.meta.url),
};

// Construct target paths within your project directory
const targetPaths = {
  dailyrunYml: path.join(process.cwd(), '.github', 'workflows', 'dailyrun.yml'),
  selfrunYml: path.join(process.cwd(), '.github', 'workflows', 'selfrun.yml'),
};

async function copyFileIfExists(source, target) {
  try {
    await copyFile(source, target);
    console.log(`Copied ${source} to ${target}`);
  } catch (error) {
    console.error(`Error copying ${source} to ${target}: ${error.message}`);
  }
}

// Prompt the user about copying GitHub Actions files
inquirer
  .prompt([
    {
      type: 'confirm',
      name: 'includeGitHubActions',
      message: 'Do you want to include GitHub Actions files?',
      default: false,
    },
  ])
  .then(async (answers) => {
    if (answers.includeGitHubActions) {
      // Copy GitHub Action workflow files to the project directory
      for (const key of Object.keys(githubActionsSourcePaths)) {
        const source = githubActionsSourcePaths[key];
        const target = targetPaths[key];

        if (!(await fileExists(target))) {
          await copyFileIfExists(source, target);
        } else {
          console.log(`Skipped copying ${source} to ${target} (already exists).`);
        }
      }

      console.log('GitHub Actions workflow files have been added to your project.');
    } else {
      console.log('GitHub Actions workflow files were not added to your project.');
    }

    // Continue with the rest of your installation logic...
  });

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
