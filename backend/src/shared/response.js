const ok   = (res, data, message = "Success",   code = 200)  => res.status(code).json({ success: true,  message, data });
const created = (res, data, message = "Created")              => ok(res, data, message, 201);
const fail = (res, message = "Error",   code = 400)           => res.status(code).json({ success: false, message });

module.exports = { ok, created, fail };
