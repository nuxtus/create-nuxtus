import { exec } from "child_process"

export function installNuxt(projectName: string): Promise<void> {
  return new Promise((resolve, reject) =>
		exec(
			`cd ${projectName} && npx nuxi init client`,
			(error) => {
				if (error) {
					reject(error)
				}
				resolve()
			}
		)
	)
}
