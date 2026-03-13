export function detectDevice(req, res, next) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const isMobileUA = /android|iphone|ipad|ipod|mobile|webos|blackberry|iemobile|opera mini/i.test(ua);
  req.isMobile = isMobileUA;
  next();
}
