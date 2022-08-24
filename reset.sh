rm -rf testProject
npm run build
NUXTUS_BRANCH=develop ./build/src/main.js testProject
