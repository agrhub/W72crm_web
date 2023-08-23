const getLocationOrigin = () => {
  return window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '')
}

const companyName = 'Farmery'
const version = 'V11.2.0'
const googleMapKey = 'AIzaSyAf5dThDkpJDkCL5OsA1yE3lrV1HQafkXk'

export default {
  version,
  companyName,
  getLocationOrigin,
  googleMapKey
}
