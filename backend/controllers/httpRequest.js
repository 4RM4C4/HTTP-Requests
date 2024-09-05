const httpRequestRouter = require('express').Router()
const axios = require('axios')
const middleware = require('../utils/middleware')

function convertArrayToObject(array) {
  return array.reduce((obj, item) => {
    if (item.key.trim() !== '') {
      obj[item.key] = item.value;
    }
    return obj;
  }, {});
}


httpRequestRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (req, res) => {
  const { method, url, headers, params, bodyType, bodyContent } = req.body
  var normalizedUrl
  if(!url.startsWith('http://') && !url.startsWith('https://')){
    normalizedUrl = 'http://' + url
  } else {
    normalizedUrl = url
  }

  const axiosConfig = {
    method,
    url: normalizedUrl,
    headers: convertArrayToObject(headers),
    params: convertArrayToObject(params),
    data: bodyType === 'json' ? JSON.parse(bodyContent) : bodyContent,
  }
  const startTime = performance.now();
  try {
    console.log(axiosConfig)
    const response = await axios(axiosConfig)
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    const bodySize = new TextEncoder().encode(JSON.stringify(response.data)).length
    const headerSize = new TextEncoder().encode(JSON.stringify(response.headers)).length
    const responseData = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      time: responseTime,
      bodysize: bodySize,
      headersize: headerSize,
    };

    res.json(responseData)

  } catch (error) {
    console.error('Error en la solicitud:', error.message);
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    var responseData = {
      status: '',
      statusText: '',
      data: '',
      headers: '',
      time: responseTime,
      bodysize: '',
      headersize: '',
    };
    if (error.response) {
      if (error.response.data) {
        responseData.bodysize = new TextEncoder().encode(JSON.stringify(error.response.data)).length
        responseData.data = error.response.data
      }
      if (error.response.headers) {
        responseData.headers = error.response.headers
        responseData.headerSize = new TextEncoder().encode(JSON.stringify(error.response.headers)).length
      }
      if (error.response.status) {
        responseData.status = error.response.status
      }
      if (error.response.statusText) {
        responseData.statusText = error.response.statusText
      }
    }
    res.json(responseData)
  }
})

module.exports = httpRequestRouter