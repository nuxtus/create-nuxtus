rm -rf testProject
npm run build
NUXTUS_BRANCH=feature/20220823-create-nuxtus-tidy node ./build/src/main.js testProject
