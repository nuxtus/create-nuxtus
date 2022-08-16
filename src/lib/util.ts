import * as fs from "fs"
import * as path from "path"

export enum ProjectType {
  Directus = "server",
  Nuxt = "client"
}

/**
 * Replace the name "server" with the project name supplied by user
 * @param projectName
 */
 export function updatePackageJson(projectName: string, projectTye: ProjectType) {
  const packageJson = path.join(process.cwd(), projectName, projectTye, "package.json")
  const packageJsonContent = fs.readFileSync(packageJson, "utf8")
  const packageJsonObject = JSON.parse(packageJsonContent)
  packageJsonObject.name = projectName
  fs.writeFileSync(packageJson, JSON.stringify(packageJsonObject, null, 2))
}
