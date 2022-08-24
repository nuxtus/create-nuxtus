import { exec } from "child_process"

export function installNuxt(): Promise<void> {
  return new Promise((resolve, reject) =>
  exec("cd client && npm install", (error) => {
    if (error) {
      reject(error)
    }
    resolve()
  })
	)
}
