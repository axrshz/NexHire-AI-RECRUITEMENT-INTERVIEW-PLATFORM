let accessToken = localStorage.getItem('accessToken') || null

export const SetAccessToken = (token) => {
    accessToken = token
    if (token) {
        localStorage.setItem('accessToken', token)
    } else {
        localStorage.removeItem('accessToken')
    }
}

export const GetAccessToken = () => {
    if (!accessToken) {
        accessToken = localStorage.getItem('accessToken')
    }
    return accessToken
}

export const ClearAccessToken = () => {
    accessToken = null
    localStorage.removeItem('accessToken')
}
