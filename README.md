# Starbucks PH Macros

A personal, non-commercial reference for browsing Starbucks Philippines drinks and comparing nutrition by customization. This independent project is not affiliated with Starbucks Corporation.

## Run locally

```sh
npm install
npm run dev
```

## Deploy to GitHub Pages

The workflow deploys the `main` branch to [https://jamesandrew1315.github.io/sb-ph-macros/](https://jamesandrew1315.github.io/sb-ph-macros/) whenever changes are pushed. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. After the workflow file is pushed to GitHub, the first deployment can also be started from the Actions tab with **Deploy to GitHub Pages → Run workflow**.

## Nutrition data

The bundled menu data is extracted from the [Starbucks Philippines Calorie Content and Nutrition Information Database](https://starbucks.ph/docs/CalorieContentandNutriInfoDatabase.pdf). It includes 1,097 listed drink, size, milk, and whipped-cream combinations. The app only offers combinations found in the source and does not estimate nutrition for unlisted customizations.