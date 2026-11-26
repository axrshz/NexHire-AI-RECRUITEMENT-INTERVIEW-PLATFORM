let accessToken = null

export const SetAccessToken = (token) => {
    accessToken = token
}

export const GetAccessToken = () => {
    return accessToken
}

export const ClearAccessToken = () => {
    accessToken = null
}
