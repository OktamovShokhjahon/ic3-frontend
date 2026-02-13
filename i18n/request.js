const { getRequestConfig } = require('next-intl/server');

module.exports = getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../src/messages/${locale}.json`)).default
}));
