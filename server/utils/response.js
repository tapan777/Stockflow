const send = {
  ok:           (res, data)          => res.status(200).json({ success: true,  data }),
  created:      (res, data)          => res.status(201).json({ success: true,  data }),
  badRequest:   (res, message)       => res.status(400).json({ success: false, message }),
  unauthorized: (res, message)       => res.status(401).json({ success: false, message }),
  notFound:     (res, message)       => res.status(404).json({ success: false, message }),
  conflict:     (res, message)       => res.status(409).json({ success: false, message }),
  serverError:  (res, message = 'Internal server error') => res.status(500).json({ success: false, message }),
};

module.exports = send;
