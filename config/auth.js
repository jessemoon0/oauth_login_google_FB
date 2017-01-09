//Facebook auth
module.exports = {
  //See passport.js for the configuration
  'facebookAuth': {
    //Facebook App ID
    'clientID': '451407665247299',
    //Facebook App Secret
    'clientSecret': '21aeabc25564a1fc607c24bb3748e7b8',
    //When FB responds, is secure to send data to this location
    'callbackURL': 'http://localhost:8080/auth/facebook/callback'
  },
  'googleAuth': {
    'clientID': '834675416740-5kut02s5ijsnncevv88oe6regace34m3.apps.googleusercontent.com',
    'clientSecret': 'unH6aFgwZOHtmxiT2ZYfLa8t',
    'callbackURL': 'http://localhost:8080/auth/google/callback'
  }
}
