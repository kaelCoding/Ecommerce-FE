import { init_auth } from "./auth"

export const init_store = async () => {
    await init_auth()
}

