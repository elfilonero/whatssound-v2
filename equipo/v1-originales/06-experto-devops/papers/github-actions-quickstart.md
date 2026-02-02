# Quickstart for GitHub Actions
Source: https://docs.github.com/en/actions/quickstart

## Introduction

GitHub Actions is a continuous integration and continuous delivery (CI/CD) platform that allows you to automate your build, test, and deployment pipeline. You can create workflows that run tests whenever you push a change to your repository, or that deploy merged pull requests to production.

## Using workflow templates

GitHub provides preconfigured workflow templates:

- **CI**: Continuous Integration workflows
- **Deployments**: Deployment workflows
- **Automation**: Automating workflows
- **Code Scanning**: Code Scanning workflows
- **Pages**: Pages workflows

Browse templates at: https://github.com/actions/starter-workflows

## Prerequisites

- Basic knowledge of GitHub
- A repository on GitHub
- Access to GitHub Actions

## Creating your first workflow

1. Create a workflow file called `github-actions-demo.yml` in the `.github/workflows` directory.

2. Copy the following YAML contents:

```yaml
name: GitHub Actions Demo
run-name: ${{ github.actor }} is testing out GitHub Actions 🚀
on: [push]
jobs:
  Explore-GitHub-Actions:
    runs-on: ubuntu-latest
    steps:
      - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
      - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
      - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."
      - name: Check out repository code
        uses: actions/checkout@v5
      - run: echo "💡 The ${{ github.repository }} repository has been cloned to the runner."
      - run: echo "🖥️ The workflow is now ready to test your code on the runner."
      - name: List files in the repository
        run: |
          ls ${{ github.workspace }}
      - run: echo "🍏 This job's status is ${{ job.status }}."
```

3. Click **Commit changes**.

## Viewing your workflow results

1. Navigate to repository → **Actions**
2. Click the workflow name
3. Click the run name
4. Click the job to see logs

## Next steps

- Using workflow templates
- Building and testing your code (CI)
- Publishing packages
- Deploying to third-party platforms
- Managing your work with GitHub Actions
- GitHub Actions certification
