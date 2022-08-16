import * as fs from "fs";
import * as path from "path";
export var ProjectType;
(function (ProjectType) {
    ProjectType["Directus"] = "server";
    ProjectType["Nuxt"] = "client";
})(ProjectType = ProjectType || (ProjectType = {}));
/**
 * Replace the name "server" with the project name supplied by user
 * @param projectName
 */
export function updatePackageJson(projectName, projectTye) {
    const packageJson = path.join(process.cwd(), projectName, projectTye, "package.json");
    const packageJsonContent = fs.readFileSync(packageJson, "utf8");
    const packageJsonObject = JSON.parse(packageJsonContent);
    packageJsonObject.name = projectName;
    fs.writeFileSync(packageJson, JSON.stringify(packageJsonObject, null, 2));
}
//# sourceMappingURL=util.js.map