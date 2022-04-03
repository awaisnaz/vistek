//////////////////////////////////////////////////INITIALIZATION//////////////////////////////////////////////////////////////////////
//express
import express from "express"; //main REST API handler
import multer from "multer"; // populates req.body with upload form data.
import cookieparser from "cookie-parser"; //populates req.cookies.
import compression from "compression";
let app = express(); //initializing express instance.
app.disable('x-powered-by');//it can for for XSS attacks.
app.use(cookieparser());// populates req.cookies.
app.use(express.json()); //process json in the body of the html.
app.use(express.urlencoded({extended: true})); //populates req.body with form data.
app.use(express.static('assets')); // makes a subfolder for static files.
app.use(compression());
let upload = multer(); // populates req.body with upload form data.
let server = app.listen(process.env.PORT || 8080, "0.0.0.0", () => console.log("server started.")); //Start the server. heroku adds env automatically so process.env.PORT is necessary.


//gun database
//Database Structure:
//gun.users.id
//gun.vehicles.id
//gun.webhooks.id 
import Gun from "gun";// gun stores null, not undefined. Can not store object if a string or null is already stored on a node, it fails silently. gun does not have event loop, thus it may ignore crud operations if busy. gun can not save arrays, so use the listed functions below to save/retrieve arrays, ".put(array2object(document))", and "Object.keys(resp.arraylist).map((key) => resp.arraylist[key])".
import "gun/lib/load.js";//load returns the full hierarchy, not just first depth which is the default.
import "gun/lib/path.js";//path is convenience wrapper over gun.get such that we can give path in the argument.
let gun = Gun({
  s3: { // Optional; update to save a copy to AWS S3
    key: 'AKIAXPDPHMRN4YDG7R5S', // AWS Access Key
    secret: '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', // AWS Secret Token
    bucket: 'vistek' // The bucket you want to save into
  },
  web: server
});
// let gun = Gun({web: server});
function array2object(arr) {
  var obj = {};
	Gun.list.map(arr, function(v, f, t) {
		if (Gun.list.is(v) || Gun.obj.is(v)) {
      obj[f] = array2object(v);
      return;
		}
    if (isNaN(f)) obj[f] = v;
    else obj[f - 1] = v;
	})
	if (obj[0]) {
    obj.length = Object.keys(obj).sort().pop();
    obj.length++;
	}
  return obj;
};


//encryption-decryption
import crypto from "crypto"; //to make email verification using encrypted key. It is builtin into node.
let emailverificationencryptionkey = "nVRQO_K1GVt}yH1Plkl9?V~EWu-/1y67"; //email verification encruption key
let emailverificationencryptionvector = "MIGeMA0GCSqGSIb3"; //email verification encruption key
function encrypt(data) {
	const cipher = crypto.createCipheriv("aes-256-cbc", emailverificationencryptionkey, emailverificationencryptionvector)
	let encryptedData = cipher.update(data, 'utf-8', 'hex')
	encryptedData += cipher.final('hex')
	return encryptedData
}
function decrypt(data){
  const decipher = crypto.createDecipheriv("aes-256-cbc", emailverificationencryptionkey, emailverificationencryptionvector);
  if (data) {
    let decryptedData = decipher.update(data, 'hex', 'utf-8');
    decryptedData += decipher.final('utf-8');
    return decryptedData;
  }
  else return null;
}

//email
import nodemailer from "nodemailer";
function sendemail(receiver,message){
  nodemailer
    .createTransport({
      "host": "smtpout.secureserver.net",
      "port": 465, //465 for ssl, 587 for non-ssl
      "secure": true, // true means use SSL
      "auth": {
        "user": "support@vehicleinformationsystem.com",
        "pass": "Spring@202!",
      },
      "tls": {
        "rejectUnauthorized": false // do not fail on invalid certs
      }
    })
    .sendMail({
      "from": `VISTEK - Vehicle Information Systems <support@vehicleinformationsystem.com>`,
      "to": `${receiver}`, 
      "subject": "Message from VISTEK - Vehicle Information Systems",
      "html": message 
    }, (error) => {
      if(error) console.log(error);
      if(!error) console.log('Email sent.');
    });
};

//superagent fetch
import superagent from "superagent";

//stripe api
import Stripe from "stripe";
let stripe = Stripe("sk_test_51Jqd3RDg36XfZ4PUQmHwNmvavJbe4TlhaktAFbEAJUkPrcOxQxDy7SwyNaE1ubfjrEyc9XQ8BgPiYgGHcQ96zeY600pJwvegb9");
gun.get("webhooks").get("stripe").once(res => {//gun crud operations are not event based, they are either taken or dropped, so do time gun operations accordingly.
  if (!res) {
    stripe.webhookEndpoints.create({//same endpoint created twice leads to duplication of webhooks. maximum 16 webhooks allowed. So, call it only once.
      url: 'http://vistek.eu-west-2.elasticbeanstalk.com/webhook',
      enabled_events: [
        'charge.failed',
        'charge.succeeded',
      ],
    }).then(res => {
      gun.get("webhooks").get("stripe").put({//using nested json instead of using nested get statements is required to put nested data on already filled node.
        "id": res.id,
        "url": res.url
      });
      console.log("stripe webhook created");
    });
  }
});

////////////////////////////////////// APP ENDPOINTS //////////////////////////////////////////////////
app.use((req, res, next) => {
  req.timestamp = Date.now();
  req.dom = {//req stores values from previous request sessions, so need to initialize it on every request. Initializing the dom variable to null otherwise, error occurs of reading/writing attirbute of undefined nested object in if statements and crud code.
    page: null,
    home: {
      banner: {
        bg: {
          message: {
            text: "",
            color: ""
          }
        }
      }
    },
    account: {
      login: {
        active: null,
        status: null,
        role: null,
        last: 0,
        message: {
          text: null,
          color: null
        }
      },
      register: {
        message: {
          text: null,
          color: null
        }
      },
      reset: {
        message: {
          text: null,
          color: null
        }
      }
    },
    dashboard: {
      reports: {
        balance: {
          message: {
            text: "",
            color: ""
          }
        },
        add: {
          message: {
            text: "",
            color: ""
          }
        },
        search: {
          regno: null,
          message: {
            text: "",
            color: ""
          }
        },
        cars: {},
        page: 1
      },
      balance: {
        basic: 0,
        full: 0,
        message: {
          text: null,
          color: null
        },
        transactions: {}
      },
      profile: {
        name: null,
        email: null,
        contact: null,
        password: null,
        message: {
          text: null,
          color: null
        }
      }
    },
    admin: {
      root: null,
      id: null,
      json: {},
      message: "",          
    },
    report: {
      regno: null,
      mode: null,
      dvla: null,
      valuation: null,
      vehicleandmothistory: {
        VehicleRegistration: null,
        MotHistory: {
          RecordList: null
        }
      },
      full: null
    },
    contact: {
      message: {
        text: null,
        color: null
      }
    },
  };
  req.sent = null;//default on every session.

  req.cookies.user = decrypt(req.cookies.user);

  if (req.body.accountloginemail) {
    req.body.accountloginemail = req.body.accountloginemail.toUpperCase();
    req.cookies.user = req.body.accountloginemail;
    res.cookie("user", encrypt(req.body.accountloginemail));
    res.cookie("cookie", 0);
  }

  if (req.body.accountregisteremail) {
    req.body.accountregisteremail = req.body.accountregisteremail.toUpperCase();
    req.cookies.user = req.body.accountregisteremail;
    res.cookie("user", encrypt(req.body.accountregisteremail));
    res.cookie("cookie", 0);
  }

  if (req.query.accountregisterconfirm) {
    req.query.accountregisterconfirm = req.query.accountregisterconfirm.toUpperCase();
    req.cookies.user = req.query.accountregisterconfirm;
    res.cookie("user", encrypt(req.query.accountregisterconfirm));
    res.cookie("cookie", 0);
  }

  if (req.body.accountresetemail) {
    req.body.accountresetemail = req.body.accountresetemail.toUpperCase();
    req.cookies.user = req.body.accountresetemail;
    res.cookie("user", encrypt(req.body.accountresetemail));
    res.cookie("cookie", 0);
  }

  if (req.query.accountresetconfirm) {
    req.query.accountresetconfirm = req.query.accountresetconfirm.toUpperCase();
    req.cookies.user = req.query.accountresetconfirm;
    res.cookie("user", encrypt(req.query.accountresetconfirm));
    res.cookie("cookie", 0);
  }

  if (req.url == "/webhook" && req.body.type == 'charge.succeeded' && req.body.data.object.billing_details.email) {
    req.body.data.object.billing_details.email = req.body.data.object.billing_details.email.toUpperCase();
    req.cookies.user = req.body.data.object.billing_details.email;
  }

  if (req.cookies.user) {
    gun.get("users").get(req.cookies.user).once(res => {
      if (res) {
        gun.get("users").get(req.cookies.user).load(res => {
          if (res) {
            req.dom = res;
            next();
          }
          if (!res) {//if database malfunctions, and doesn't return anything then redirect
            res.redirect(req.url);
          }
        });// no need to give {wait:x} at the gun.load for full doc load, after coding gun.once before it.
      }
      if (!res) {
        next();
      }
    });//gun.load hangs if gun.once is not called before it.    
  }

  if (!req.cookies.user) next();
});

//home page rest endpoint
app.get("/", (req, res, next) => {// .get is required so it does not mess by setting req.dom.page for all queries.
  req.dom.page = "/";//it it at last to account for any session changes
  
  if (req.query.homebannerbgmessage) {
    req.dom.home.banner.bg.message.text = "Please enter Vehicle Registration Number above to get its Report.";
    req.dom.home.banner.bg.message.color = "#B00020";
  }
  
  next();
});

app.use("/account/login", (req, res, next) => {
  if(req.body.accountloginemail) req.body.accountloginemail = req.body.accountloginemail.toUpperCase();
  
  if (req.dom.account.login.status) {
    res.redirect("/dashboard/reports");
    req.sent = 1;//end express session
  }

  req.dom.account.login.message.text = null;//initialization

  if (req.body.accountloginemail && req.body.accountloginpassword && Date.now() <= req.dom.account.login.last + 1000) {
    req.dom.account.login.message.text = "You have performed too many login attempts in a short span of time, please wait some time before logging in again.";
    req.dom.account.login.message.color = "#B00020";
  }

  if (req.body.accountloginemail && req.body.accountloginpassword && Date.now() >= req.dom.account.login.last + 1000) {
    if (req.body.accountloginpassword != decrypt(req.dom.dashboard.profile.password)) {
      req.dom.account.login.message.text = "You have entered wrong email or password, please re-enter the correct email/password.";
      req.dom.account.login.message.color = "#B00020";
    }
    if (req.body.accountloginpassword == decrypt(req.dom.dashboard.profile.password) && !req.dom.account.login.active) {
      req.dom.account.login.message.text = "You have not verified your email address yet. Please check your email and click on the confirmation link to verify your email address, to use the Vehicle Information System (VIS).";
      req.dom.account.login.message.color = "#B00020";
    }
    if (req.body.accountloginpassword == decrypt(req.dom.dashboard.profile.password) && req.dom.account.login.active) {
      req.dom.account.login.status = 1;
      res.redirect("/dashboard/reports");
      req.sent = 1;//end express session
    }
  }
  if (req.query.accountregisterconfirm) { 
    req.dom.account.login.message.text = "You have successfully registered and activated your account. Please login to continue to the dashboard.";
    req.dom.account.login.message.color = "#6200EE";
  }
  if (req.query.accountresetconfirm) { 
    req.dom.account.login.message.text = "You have successfully reset your account password. Please login to continue to the dashboard.";
    req.dom.account.login.message.color = "#6200EE";
  }

  req.dom.account.login.last = Date.now();
  req.dom.page = "/account/login";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/account/register", (req, res, next) => {
  if(req.body.accountregisteremail) req.body.accountregisteremail = req.body.accountregisteremail.toUpperCase();
  if(req.body.accountregistername) req.body.accountregistername = req.body.accountregistername.toUpperCase();
  
  if (req.dom.account.login.status) {
    res.redirect("/dashboard/reports");
    req.sent = 1;//end express session
  }
  
  req.dom.account.register.message.text = null;//initialization

  if (req.body.accountregisteremail && req.body.accountregisterpassword) {
    req.dom.dashboard.profile.name = req.body.accountregistername ? req.body.accountregistername : "User";
    req.dom.dashboard.profile.email = req.cookies.user ? req.cookies.user : "user@example.com";
    req.dom.dashboard.profile.contact = req.body.accountregistercontact ? req.body.accountregistercontact : "";
    req.dom.dashboard.profile.password = encrypt(req.body.accountregisterpassword);
    req.dom.dashboard.balance.basic = 0;
    req.dom.dashboard.balance.full = 0;
    req.dom.dashboard.reports.cars = {};
    req.dom.account.register.message.text = "Thank you for registering as a user of Vehicle Information System (VIS). Please check your email and click on the confirmation link to verify your email address.";
    req.dom.account.register.message.color = "#6200EE";
    if (req.body.accountregisteremail == "sakeg27302@shackvine.com") req.dom.account.login.role = "admin";
    if (req.hostname == "localhost") sendemail(req.cookies.user, `Dear <a href="${req.cookies.user}">${req.cookies.user}</a>, <br/><br/> Your VISTEK Account has been created, please click on the URL below to activate it: <br/><br/> <a href="http://${req.headers.host}/account/register?accountregisterconfirm=${req.cookies.user}&token=${encrypt(req.cookies.user)}">http://${req.headers.host}/account/register?accountregisterconfirm=${req.cookies.user}&token=${encrypt(req.cookies.user)}</a> <br/><br/> Regards, <br/> VISTEK Team.`);
    if (req.hostname != "localhost") sendemail(req.cookies.user, `Dear <a href="${req.cookies.user}">${req.cookies.user}</a>, <br/><br/> Your VISTEK Account has been created, please click on the URL below to activate it: <br/><br/> <a href="http://${req.hostname}/account/register?accountregisterconfirm=${req.cookies.user}&token=${encrypt(req.cookies.user)}">http://${req.hostname}/account/register?accountregisterconfirm=${req.cookies.user}&token=${encrypt(req.cookies.user)}</a> <br/><br/> Regards, <br/> VISTEK Team.`);
  }

  if (req.query.accountregisterconfirm && req.query.accountregisterconfirm == decrypt(req.query.token)) {
    req.dom.account.login.active = "ACTIVE";
    res.redirect("/account/login?accountregisterconfirm=1");
    req.sent = 1;//end express session
  }

  req.dom.page = "/account/register";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/account/reset", (req, res, next) => {
  if(req.body.accountresetemail) req.body.accountresetemail = req.body.accountresetemail.toUpperCase();  
  
  if (req.dom.account.login.status) {
    res.redirect("/dashboard/reports");
    req.sent = 1;//end express session
  }

  req.dom.account.reset.message.text = null;//initialization

  if (req.body.accountresetemail) {
    req.dom.account.reset.message.text = "Please check your email, and click on the email verification link, to change your password. The password will remain unchanged without email verification.";
    req.dom.account.reset.message.color = "#6200EE";
    if (req.hostname == "localhost") sendemail(req.cookies.user,`click <a href="http://${req.headers.host}/account/reset?accountresetconfirm=${req.cookies.user}&token=${encrypt(req.body.accountresetemail)}&accountresetpassword=${encrypt(req.body.accountresetpassword)}">here</a> to change your password. If this was not you, you can safely ignore this email.`);
    if (req.hostname != "localhost") sendemail(req.cookies.user,`click <a href="https://${req.hostname}/account/reset?accountresetconfirm=${req.cookies.user}&token=${encrypt(req.body.accountresetemail)}&accountresetpassword=${encrypt(req.body.accountresetpassword)}">here</a> to change your password. If this was not you, you can safely ignore this email.`);
  }

  if (req.query.accountresetconfirm && req.query.accountresetconfirm  == decrypt(req.query.token)) {
    req.dom.dashboard.profile.password = req.query.accountresetpassword;
    sendemail(req.cookies.user, `Your password has been reset. If this was you, you can safely ignore this email.`);
    res.redirect("/account/login?accountresetconfirm=1");
    req.sent = 1;//end express session
  }

  req.dom.page = "/account/reset";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/account/logout", (req, res, next) => {
  if (req.dom.account.login.status) {
    res.redirect("/dashboard/reports");
    req.sent = 1;//end express session
  }

  req.dom.account.login.status = null;
  req.dom.page = "/account/login";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

//dashboard page rest endpoint
app.use("/dashboard/reports", (req, res, next) => {
  req.dom.page = "/dashboard/reports";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  req.dom.dashboard.reports.add.message.text = null;//initialization
  req.dom.dashboard.reports.search.regno = null;//initialization
  req.dom.dashboard.reports.search.message.text = null;//initialization
  if(req.body.dashboardreportsregno) req.body.dashboardreportsregno = req.body.dashboardreportsregno.toUpperCase();//initialization
  if(req.body.dashboardreportssearch) req.body.dashboardreportssearch = req.body.dashboardreportssearch.toUpperCase();//initialization
  

  if (!req.dom.account.login.status) {
    res.redirect("/account/login");
    req.sent = 1;//end express session
    next();
  }
  
  if (req.query.dashboardreportsbalancemessagebasic) {
    req.dom.dashboard.reports.balance.message.text = "Single Basic Report Credit has been added to your account.";
    req.dom.dashboard.reports.balance.message.color = "#CF9AFF";
  }

  if (req.query.dashboardreportsbalancemessagefull) {
    req.dom.dashboard.reports.balance.message.text = "1 Full Report Credit has been added to your account.";
    req.dom.dashboard.reports.balance.message.color = "#CF9AFF";
  }

  if (req.query.dashboardreportsbalancemessagemulti) {
    req.dom.dashboard.reports.balance.message.text = "3 Full Report Credits have been added to your account.";
    req.dom.dashboard.reports.balance.message.color = "#CF9AFF";
  }

  if (req.query.dashboardreportsbalancemessagecancel) {
    req.dom.dashboard.reports.balance.message.text = "Your transaction has been cancelled and your card was not charged, nor any balance were settled at your account.";
    req.dom.dashboard.reports.balance.message.color = "#CF6679";
  }
  
  if (req.body.dashboardreportsbalanceaddbasic) {
    stripe.checkout.sessions.create({
      customer_email: req.cookies.user,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'BASIC VIS REPORT',
              images: ['http://vistek.eu-west-2.elasticbeanstalk.com/reportbasic.jpg'],
            },
            unit_amount: 249,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: req.body.dashboardreportsbalanceaddbasic == "ORDER BASIC REPORT" ? "http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/reports?dashboardreportsbalancemessagebasic=1" : `http://vistek.eu-west-2.elasticbeanstalk.com/report?regno=${req.body.dashboardreportsbalanceaddbasic}`,
      cancel_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/reports?dashboardreportsbalancemessagecancel=1'
    })
      .then(resp => {
        res.redirect(resp.url);
        req.sent = 1;//end express session
        next();
      })
      .catch(err => {
        console.log(err);
      });
  }

  if (req.body.dashboardreportsbalanceaddfull) {
    stripe.checkout.sessions.create({
      customer_email: req.cookies.user,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'FULL VIS REPORT',
              images: ['http://vistek.eu-west-2.elasticbeanstalk.com/reportfull.jpg'],
            },
            unit_amount: 799,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: req.body.dashboardreportsbalanceaddfull == "ORDER FULL REPORT" ? "http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/reports?dashboardreportsbalancemessagebasic=1" : `http://vistek.eu-west-2.elasticbeanstalk.com/report?regno=${req.body.dashboardreportsbalanceaddfull}`,
      cancel_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/reports?dashboardreportsbalancemessagecancel=1'
    })
      .then(resp => {
        res.redirect(resp.url);
        req.sent = 1;//end express session
        next();
      })
      .catch(err => {
        console.log(err);
      });
  }

  if (req.body.dashboardreportsbalanceaddmulti) {
    stripe.checkout.sessions.create({
      customer_email: req.cookies.user,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'MULTIPLE VIS REPORTS',
              images: ['http://vistek.eu-west-2.elasticbeanstalk.com/reportmulti.jpg'],
            },
            unit_amount: 1445,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/reports?dashboardreportsbalancemessagemulti=1',
      cancel_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/reports?dashboardreportsbalancemessagecancel=1'
    })
      .then(resp => {
        res.redirect(resp.url);
        req.sent = 1;//end express session
        next();
      })
      .catch(err => {
        console.log(err);
      });
  }

  if (req.body.dashboardreportsaddcar) {
    superagent
      .post("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles")
      .set('x-api-key', 'lnJTBRkwbm4Fxf5SWwCAi9l7OPV9pDTB7OvGpt6H')
      .set('Content-Type', 'application/json')
      .send({ registrationNumber: `${req.body.dashboardreportsregno}` })
      .then(res => {
        req.dom.dashboard.reports.cars[req.body.dashboardreportsregno] = {
          "timestamp": Date.now(),
          "basic": 0,
          "full": 0
        };
        next();
      })
      .catch(err => {
        console.log(err);
        req.dom.dashboard.reports.add.message.text = `ERROR! This Vehicle Registration Number does not exist: ${req.body.dashboardreportsregno}. Please Add Correct Vehicle Number Or Contact Us For Support.`;
        req.dom.dashboard.reports.add.message.color = "#CF6679";
        next();
      });
  }

  if (req.body.dashboardreportssearch) {
    superagent
      .post("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles")
      .set('x-api-key', 'lnJTBRkwbm4Fxf5SWwCAi9l7OPV9pDTB7OvGpt6H')
      .set('Content-Type', 'application/json')
      .send({ registrationNumber: `${req.body.dashboardreportssearch}` })
      .then(res => {
        req.dom.dashboard.reports.search.regno = req.body.dashboardreportssearch;
        next();
      })
      .catch(err => {
        console.log(err);
        req.dom.dashboard.reports.search.message.text = `ERROR! This Vehicle Registration Number does not exist: ${req.body.dashboardreportssearch}. Please Add Correct Vehicle Number Or Contact Us For Support.`;
        req.dom.dashboard.reports.search.message.color = "#CF6679";
        next();
      });
  }
  
  if(!req.body.dashboardreportsbalanceaddbasic && !req.body.dashboardreportsbalanceaddfull && !req.body.dashboardreportsbalanceaddmulti && !req.body.dashboardreportsaddcar && !req.body.dashboardreportssearch) next();
});

app.use("/dashboard/balance", (req, res, next) => {

  if (!req.dom.account.login.status) {
    res.redirect("/account/login");
    req.sent = 1;//end express session
  }

  req.dom.dashboard.balance.message.text = null;

  if (req.query.dashboardbalancemessagebasic) {
    req.dom.dashboard.balance.message.text = "Single Basic Report Credit has been added to your account.";
    req.dom.dashboard.balance.message.color = "#CF9AFF";
  }

  if (req.query.dashboardbalancemessagefull) {
    req.dom.dashboard.balance.message.text = "1 Full Report Credit has been added to your account.";
    req.dom.dashboard.balance.message.color = "#CF9AFF";
  }

  if (req.query.dashboardbalancemessagemulti) {
    req.dom.dashboard.balance.message.text = "3 Full Report Credits have been added to your account.";
    req.dom.dashboard.balance.message.color = "#CF9AFF";
  }

  if (req.query.dashboardbalancemessagecancel) {
    req.dom.dashboard.balance.message.text = "Your transaction has been cancelled and your card was not charged, nor any balance were settled at your account.";
    req.dom.dashboard.balance.message.color = "#CF6679";
  }

  if (req.body.dashboardbalanceaddbasic) {
    stripe.checkout.sessions.create({
      customer_email: req.cookies.user,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'BASIC VIS REPORT',
              images: ['http://vistek.eu-west-2.elasticbeanstalk.com/reportbasic.jpg'],
            },
            unit_amount: 249,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: "http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/balance?dashboardbalancemessagebasic=1",
      cancel_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/balance?dashboardbalancemessagecancel=1'
    })
      .then(resp => {
        res.redirect(resp.url);
        req.sent = 1;//end express session
        next();
      })
      .catch(err => {
        console.log(err);
      });
  }

  if (req.body.dashboardbalanceaddfull) {
    stripe.checkout.sessions.create({
      customer_email: req.cookies.user,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'FULL VIS REPORT',
              images: ['http://vistek.eu-west-2.elasticbeanstalk.com/reportfull.jpg'],
            },
            unit_amount: 799,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/balance?dashboardbalancemessagefull=1',
      cancel_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/balance?dashboardbalancemessagecancel=1'
    })
      .then(resp => {
        res.redirect(resp.url);
        req.sent = 1;//end express session
        next();
      })
      .catch(err => {
        console.log(err);
      });
  }

  if (req.body.dashboardbalanceaddmulti) {
    stripe.checkout.sessions.create({
      customer_email: req.cookies.user,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'MULTIPLE VIS REPORTS',
              images: ['http://vistek.eu-west-2.elasticbeanstalk.com/reportmulti.jpg'],
            },
            unit_amount: 1445,
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/balance?dashboardbalancemessagemulti=1',
      cancel_url: 'http://vistek.eu-west-2.elasticbeanstalk.com/dashboard/balance?dashboardbalancemessagecancel=1'
    })
      .then(resp => {
        res.redirect(resp.url);
        req.sent = 1;//end express session
        next();
      })
      .catch(err => {
        console.log(err);
      });
  }

  req.dom.page = "/dashboard/balance";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  if(!req.body.dashboardbalanceaddbasic && !req.body.dashboardbalanceaddfull && !req.body.dashboardbalanceaddmulti) next();
});

app.use("/dashboard/profile", (req, res, next) => {
  if (!req.body.dashboardprofilesubmit) req.dom.dashboard.profile.message.text = null;//initialization

  if (!req.dom.account.login.status) {
    res.redirect("/account/login");
    req.sent = 1;//end express session
  }
  
  if (req.body.dashboardprofilesubmit && req.dom.dashboard.profile.password != encrypt(req.body.dashboardpasswordcurrent)) {
    req.dom.dashboard.profile.message.text = "Your changes have not been saved. Please enter the correct current password.";
    req.dom.dashboard.profile.message.color = "#CF6679";
  }
  
  if (req.body.dashboardprofilesubmit && req.dom.dashboard.profile.password == encrypt(req.body.dashboardpasswordcurrent)) {
    req.dom.dashboard.profile.contact = req.body.dashboardprofilecontactnew;
    if(req.body.dashboardprofilepasswordnew) req.dom.dashboard.profile.password = encrypt(req.body.dashboardprofilepasswordnew);
    req.dom.dashboard.profile.message.text = "Account details changed successfully.";
    req.dom.dashboard.profile.message.color = "#BB86FC";
    sendemail(req.cookies.user, "Your account details have been changed successfully at VISTEK. If it was not you, please contact us.");
  }

  req.dom.page = "/dashboard/profile";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/admin", (req, res, next) => {
  // if (req.dom.account.login.role != "admin" || !req.dom.account.login.status) {
  //   res.send(403);
  //   req.sent = 1;//end express session
  // }

  req.dom.page = "/admin";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  req.dom.admin.root = req.body.root != null ? req.body.root : null;
  req.dom.admin.id = req.body.id != null ? req.body.id : null;
  req.dom.admin.json = null;
  req.dom.admin.message = "";
  if (req.body.json) gun.get(req.body.root).get(req.body.id).put(JSON.parse(req.body.json));
  if (req.body.root && req.body.id) {
    gun.get(req.body.root).get(req.body.id).once(res => {
      if (res) {
        gun.get(req.body.root).get(req.body.id).load(res => {
          req.dom.admin.json = res;
          req.dom.admin.message = "The record is successfully retrieved.";
          if (req.body.json) req.dom.admin.message = "The record is successfully saved.";
          next();
        });
      }
      else next();
    });
  }
  else {
    next();
  }
});

//report page rest endpoint
app.use("/report", upload.array(), (req, res, next) => {
  req.dom.report.regno = null;//initialization
  req.dom.report.mode = null;//initialization
  req.dom.report.dvla = null;//initialization
  req.dom.report.basic = null;//initialization
  req.dom.report.valuation = null;//initialization
  req.dom.report.vehicleandmothistory.MotHistory.RecordList = null;//initialization
  req.dom.report.vehicleandmothistory.VehicleRegistration = null;//initialization
  req.dom.report.full = null;//initialization
  req.dom.report.counter = 0;//initialization
  req.dom.page = "/report";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it. Setting it before other code helps set it before next() statement.

  if (req.body.regno) {
    let temp = req.body.regno.split("-");
    req.dom.report.regno = temp[0].toUpperCase();
    req.dom.report.mode = temp[1];
  }
  
  if (req.query.regno) {
    let temp = req.query.regno.split("-");
    req.dom.report.regno = temp[0].toUpperCase();
    req.dom.report.mode = temp[1];
  }

  if (req.dom.report.regno) {
    gun.get("vehicles").get(req.dom.report.regno).get("dvla").once(res => {//gun.load does does not work if there is no data on the node, so check before by gun.once if there is data on the node or not
      if (res) {
        gun.get("vehicles").get(req.dom.report.regno).get("dvla").load((res) => {//gun.load frequently hangs, so use gun.once before it so it does not hangs.
          req.dom.report.dvla = res;
          req.dom.report.counter++;
          if (req.dom.report.counter >= 4) next();
        });
      }
      else {
        superagent
          .post("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles")
          .set('x-api-key', 'lnJTBRkwbm4Fxf5SWwCAi9l7OPV9pDTB7OvGpt6H')
          .set('Content-Type', 'application/json')
          .send({ registrationNumber: `${req.dom.report.regno}` })
          .then(res => {
            gun.get("vehicles").get(req.dom.report.regno).get("dvla").put(res.body);
            req.dom.report.dvla = res.body;
            req.dom.report.counter++;
            if (req.dom.report.counter >= 4) next();
          })
          .catch(err => {
            console.log(err);
            req.dom.report.dvla = "error";
            req.dom.report.counter = req.dom.report.counter + 4;//dvla api fails with .catch, but vdicheck api's fails silently without .catch. So, when dvla api fails, it means that the registration number does not exist.
            if (req.dom.report.counter >= 4) next();
          });
      }
    });
  }
  else { 
    req.dom.report.counter++;
    if (req.dom.report.counter >= 4) next();
  }

  if (req.dom.report.regno && (req.dom.report.regno == "AA19AAA" || (req.dom.dashboard.reports.cars[req.dom.report.regno] && req.dom.dashboard.reports.cars[req.dom.report.regno].basic || req.dom.dashboard.reports.cars[req.dom.report.regno] && req.dom.dashboard.reports.cars[req.dom.report.regno].full || ((req.dom.dashboard.balance.basic || req.dom.dashboard.balance.full) && (req.dom.report.mode == "basic" || req.dom.report.mode == "full"))))) {
    gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("valuationdata").once((res) => {//gun.load does does not work if there is no data on the node, so check before by gun.once if there is data on the node or not
      if (res && req.dom.dashboard.reports.cars[req.dom.report.regno].basicvdivaluationdata) {
        gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("valuationdata").load((res) => {//gun.load frequently hangs, so use gun.once before it so it does not hangs.
          req.dom.report.valuation = res;
          if (req.dom.report.regno != "AA19AAA" && !req.dom.dashboard.reports.cars[req.dom.report.regno].basic && req.dom.report.mode != "full") {
            req.dom.dashboard.balance.basic = req.dom.dashboard.balance.basic - 1;

            let time = Date.now();
            req.dom.dashboard.balance.transactions[time] = {};
            req.dom.dashboard.balance.transactions[time].time = time;
            req.dom.dashboard.balance.transactions[time].package = "Basic Report Package";
            req.dom.dashboard.balance.transactions[time].vehicle = req.dom.report.regno;
            req.dom.dashboard.balance.transactions[time].charges = null;
            req.dom.dashboard.balance.transactions[time].credits = "-1 Basic";
            req.dom.dashboard.balance.transactions[time].balancebasic = req.dom.dashboard.balance.basic;
            req.dom.dashboard.balance.transactions[time].balancefull = req.dom.dashboard.balance.full;
          }
          if (req.dom.report.regno != "AA19AAA") {
            req.dom.dashboard.reports.cars[req.dom.report.regno].basic = 1;//Place it after the basic balance minus if statement.
            req.dom.dashboard.reports.cars[req.dom.report.regno].basicvdivaluationdata = 1;//Place it after the basic balance minus if statement.
          }
          req.dom.report.counter++;
          if (req.dom.report.counter >= 4) next();
        });
      }
      else {
        //valuationtestkey = "https://uk1.ukvehicledata.co.uk/api/datapackage/ValuationData?v=2&api_nullitems=1&auth_apikey=C3BC75FB-2A5D-4246-8FA8-92B76B9B2AE6&key_VRM="
        superagent
          .get("https://uk1.ukvehicledata.co.uk/api/datapackage/ValuationData?v=2&api_nullitems=1&auth_apikey=C3BC75FB-2A5D-4246-8FA8-92B76B9B2AE6&key_VRM=" + req.dom.report.regno)
          .then(res => {
            if(Object.keys(res.body.Response.DataItems).length) gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("valuationdata").put(res.body.Response.DataItems);
            req.dom.report.valuation = res.body.Response.DataItems;
            if (req.dom.report.regno != "AA19AAA" && !req.dom.dashboard.reports.cars[req.dom.report.regno].basic && req.dom.report.mode != "full" && Object.keys(res.body.Response.DataItems).length) {
              req.dom.dashboard.balance.basic = req.dom.dashboard.balance.basic - 1;
              let time = Date.now();
              req.dom.dashboard.balance.transactions[time] = {};
              req.dom.dashboard.balance.transactions[time].time = time;
              req.dom.dashboard.balance.transactions[time].package = "Basic Report Package";
              req.dom.dashboard.balance.transactions[time].vehicle = req.dom.report.regno;
              req.dom.dashboard.balance.transactions[time].charges = null;
              req.dom.dashboard.balance.transactions[time].credits = "-1 Basic";
              req.dom.dashboard.balance.transactions[time].balancebasic = req.dom.dashboard.balance.basic;
              req.dom.dashboard.balance.transactions[time].balancefull = req.dom.dashboard.balance.full;  
            }
            if (req.dom.report.regno != "AA19AAA" && Object.keys(res.body.Response.DataItems).length) {
              req.dom.dashboard.reports.cars[req.dom.report.regno].basic = 1;//place it after the basic balance minus if statement.
              req.dom.dashboard.reports.cars[req.dom.report.regno].basicvdivaluationdata = 1;//place it after the basic balance minus if statement.
            }
            req.dom.report.counter++;
            if (req.dom.report.counter >= 4) next();
          })
          .catch(err => {
            console.log(err);
            req.dom.report.basic = "error";
            req.dom.report.counter++;
            if (req.dom.report.counter >= 4) next();
          });
      }
    });
    
    gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("vehicleandmothistory").once((res) => {
      if (res && req.dom.dashboard.reports.cars[req.dom.report.regno].basicvdivehicleandmothistory) {
        gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("vehicleandmothistory").load((res) => {//gun.load frequently hangs, so use gun.once before it so it does not hangs.
          req.dom.report.vehicleandmothistory = res;
          if (req.dom.report.regno != "AA19AAA" && !req.dom.dashboard.reports.cars[req.dom.report.regno].basic && req.dom.report.mode != "full") {
            req.dom.dashboard.balance.basic = req.dom.dashboard.balance.basic - 1;

            let time = Date.now();
            req.dom.dashboard.balance.transactions[time] = {};
            req.dom.dashboard.balance.transactions[time].time = time;
            req.dom.dashboard.balance.transactions[time].package = "Basic Report Package";
            req.dom.dashboard.balance.transactions[time].vehicle = req.dom.report.regno;
            req.dom.dashboard.balance.transactions[time].charges = null;
            req.dom.dashboard.balance.transactions[time].credits = "-1 Basic";
            req.dom.dashboard.balance.transactions[time].balancebasic = req.dom.dashboard.balance.basic;
            req.dom.dashboard.balance.transactions[time].balancefull = req.dom.dashboard.balance.full;
          }
          if (req.dom.report.regno != "AA19AAA") {
            req.dom.dashboard.reports.cars[req.dom.report.regno].basic = 1;//place it after the basic balance minus if statement.
            req.dom.dashboard.reports.cars[req.dom.report.regno].basicvdivehicleandmothistory = 1;//place it after the basic balance minus if statement.
          }
          req.dom.report.counter++;
          if (req.dom.report.counter >= 4) next();
        });
      }
      else {
        //valuationtestkey = "https://uk1.ukvehicledata.co.uk/api/datapackage/ValuationData?v=2&api_nullitems=1&auth_apikey=C3BC75FB-2A5D-4246-8FA8-92B76B9B2AE6&key_VRM="
        superagent
          .get("https://uk1.ukvehicledata.co.uk/api/datapackage/VehicleAndMotHistory?v=2&api_nullitems=1&auth_apikey=87715f2c-f6a3-4f77-8527-94511f3ee5a4&key_VRM=" + req.dom.report.regno)
          .then(res => {
            req.dom.report.vehicleandmothistory = res.body.Response.DataItems;
            if(Object.keys(res.body.Response.DataItems).length) gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("vehicleandmothistory").put(array2object(res.body.Response.DataItems));
            if (req.dom.report.regno != "AA19AAA" && !req.dom.dashboard.reports.cars[req.dom.report.regno].basic && req.dom.report.mode != "full" && Object.keys(res.body.Response.DataItems).length) {
              req.dom.dashboard.balance.basic = req.dom.dashboard.balance.basic - 1;
              let time = Date.now();
              req.dom.dashboard.balance.transactions[time] = {};
              req.dom.dashboard.balance.transactions[time].time = time;
              req.dom.dashboard.balance.transactions[time].package = "Basic Report Package";
              req.dom.dashboard.balance.transactions[time].vehicle = req.dom.report.regno;
              req.dom.dashboard.balance.transactions[time].charges = null;
              req.dom.dashboard.balance.transactions[time].credits = "-1 Basic";
              req.dom.dashboard.balance.transactions[time].balancebasic = req.dom.dashboard.balance.basic;
              req.dom.dashboard.balance.transactions[time].balancefull = req.dom.dashboard.balance.full;  
            }
            if (req.dom.report.regno != "AA19AAA" && Object.keys(res.body.Response.DataItems).length) {
              req.dom.dashboard.reports.cars[req.dom.report.regno].basic = 1;//place it after the basic balance minus if statement.
              req.dom.dashboard.reports.cars[req.dom.report.regno].basicvdivehicleandmothistory = 1;//place it after the basic balance minus if statement.
            }
            req.dom.report.counter++;
            if (req.dom.report.counter >= 4) next();
          })
          .catch(err => {
            console.log(err);
            req.dom.report.basic = "error";
            req.dom.report.counter++;
            if (req.dom.report.counter >= 4) next();
          });
      }
    });
  } 
  else {
    req.dom.report.basic = null;
    //two times increment because this section has two api calls.
    req.dom.report.counter++;
    req.dom.report.counter++;
    if (req.dom.report.counter >= 4) next();
  }

  if (req.dom.report.regno && (req.dom.report.regno == "AA19AAA" || (req.dom.dashboard.reports.cars[req.dom.report.regno] && req.dom.dashboard.reports.cars[req.dom.report.regno].full || ((req.dom.dashboard.balance.full) && req.dom.report.mode == "full")))) {
    gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("vdicheckfull").once(res => {//gun.load does does not work if there is no data on the node, so check before by gun.once if there is data on the node or not
      if (res) {
        gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("vdicheckfull").load((res) => {//sometimes gun.load hangs, so calling gun.once before it helps it not hang
          req.dom.report.full = res;
          req.dom.report.counter++;
          if (req.dom.report.regno != "AA19AAA" && !req.dom.dashboard.reports.cars[req.dom.report.regno].full) {
            req.dom.dashboard.balance.full = req.dom.dashboard.balance.full - 1;
            req.dom.dashboard.reports.cars[req.dom.report.regno].full = 1;
           
            let time = Date.now();
            req.dom.dashboard.balance.transactions[time] = {};
            req.dom.dashboard.balance.transactions[time].time = time;
            req.dom.dashboard.balance.transactions[time].package = "Full Report Package";
            req.dom.dashboard.balance.transactions[time].vehicle = req.dom.report.regno;
            req.dom.dashboard.balance.transactions[time].charges = null;
            req.dom.dashboard.balance.transactions[time].credits = "-1 Full";
            req.dom.dashboard.balance.transactions[time].balancebasic = req.dom.dashboard.balance.basic;
            req.dom.dashboard.balance.transactions[time].balancefull = req.dom.dashboard.balance.full;
          }
          if (req.dom.report.counter >= 4) next();
        });
      }
      else {
        //vdicheckfulltestkey = "https://uk1.ukvehicledata.co.uk/api/datapackage/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=C3BC75FB-2A5D-4246-8FA8-92B76B9B2AE6&key_VRM=";
        superagent
          .get("https://uk1.ukvehicledata.co.uk/api/datapackage/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=C3BC75FB-2A5D-4246-8FA8-92B76B9B2AE6&key_VRM=" + req.dom.report.regno)
          .then(res => {
            if(Object.keys(res.body.Response.DataItems).length) gun.get("vehicles").get(req.dom.report.regno).get("vdicheck").get("vdicheckfull").put(array2object(res.body.Response.DataItems));
            req.dom.report.full = res.body.Response.DataItems;
            req.dom.report.counter++;
            if (req.dom.report.regno != "AA19AAA" && !req.dom.dashboard.reports.cars[req.dom.report.regno].full && Object.keys(res.body.Response.DataItems).length) {
              req.dom.dashboard.balance.full = req.dom.dashboard.balance.full - 1;
              req.dom.dashboard.reports.cars[req.dom.report.regno].full = 1;
              let time = Date.now();
              req.dom.dashboard.balance.transactions[time] = {};
              req.dom.dashboard.balance.transactions[time].time = time;
              req.dom.dashboard.balance.transactions[time].package = "Full Report Package";
              req.dom.dashboard.balance.transactions[time].vehicle = req.dom.report.regno;
              req.dom.dashboard.balance.transactions[time].charges = null;
              req.dom.dashboard.balance.transactions[time].credits = "-1 Full";
              req.dom.dashboard.balance.transactions[time].balancebasic = req.dom.dashboard.balance.basic;
              req.dom.dashboard.balance.transactions[time].balancefull = req.dom.dashboard.balance.full;
            }
            if (req.dom.report.counter >= 4) next();
          })
          .catch(err => {
            console.log(err);
            req.dom.report.full = "error";
            req.dom.report.counter++;
            if (req.dom.report.counter >= 4) next();
          });
      }
    });
  }
  else {
    req.dom.report.full = null;
    req.dom.report.counter++;
    if (req.dom.report.counter >= 4) next();
  }
});

app.use("/contact", (req, res, next) => {
  if (req.body.email) {
    req.dom.contact.message.text = "We have received your message and will contact back soon.";
    req.dom.contact.message.color = "#6200EE";
    sendemail("info@teknikality.com", `${req.body.email} has send you a message: ${req.body.message}`);
  }
  else { 
    req.dom.contact.message.text = null;
  }

  req.dom.page = "/contact";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/about", (req, res, next) => {
  req.dom.page  = "/about";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/privacy", (req, res, next) => {
  req.dom.page = "/privacy";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/terms", (req, res, next) => {
  req.dom.page = "/terms";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use("/webhook", (req, res, next) => {
  if (Object.keys(req.dom.dashboard.balance.transactions).includes((req.body.created*1000).toString())) {
    next();
  }

  if (req.body.type == 'charge.succeeded' && req.body.data.object.billing_details.email && req.body.data.object.amount == "249") {
    req.dom.dashboard.balance.basic = req.dom.dashboard.balance.basic + 1;
  }
  if (req.body.type == 'charge.succeeded' && req.body.data.object.billing_details.email && req.body.data.object.amount == "799") {
    req.dom.dashboard.balance.full = req.dom.dashboard.balance.full + 1;
  }
  if (req.body.type == 'charge.succeeded' && req.body.data.object.billing_details.email && req.body.data.object.amount == "1445") {
    req.dom.dashboard.balance.full = req.dom.dashboard.balance.full + 3;
  }

  req.body.created = req.body.created * 1000;
  req.dom.dashboard.balance.transactions[req.body.created] = {};
  req.dom.dashboard.balance.transactions[req.body.created].stripeid = req.body.id;
  req.dom.dashboard.balance.transactions[req.body.created].time = req.body.created;
  if (req.body.data.object.amount == "249") req.dom.dashboard.balance.transactions[req.body.created].package = "Basic Report Package";
  if (req.body.data.object.amount == "799") req.dom.dashboard.balance.transactions[req.body.created].package = "Full Report Package";
  if (req.body.data.object.amount == "1445") req.dom.dashboard.balance.transactions[req.body.created].package = "Multiple Reports Package";
  req.dom.dashboard.balance.transactions[req.body.created].vehicle = null;
  req.dom.dashboard.balance.transactions[req.body.created].charges = req.body.data.object.amount/100;
  if (req.body.data.object.amount == "249") req.dom.dashboard.balance.transactions[req.body.created].credits = "+1 Basic";
  if (req.body.data.object.amount == "799") req.dom.dashboard.balance.transactions[req.body.created].credits = "+1 Full";
  if (req.body.data.object.amount == "1445") req.dom.dashboard.balance.transactions[req.body.created].credits = "+3 Full";
  req.dom.dashboard.balance.transactions[req.body.created].balancebasic = req.dom.dashboard.balance.basic;
  req.dom.dashboard.balance.transactions[req.body.created].balancefull = req.dom.dashboard.balance.full;

  if (req.body.type == 'charge.succeeded') {
    console.log("webhook:", {
      "time": Date.now(),
      "email": req.body.data.object.billing_details.email,
      "amount": req.body.data.object.amount,
      "status": req.body.type
    });
    res.status(200).send('OK');//sending status of 200 is must otherwise, stripe will keep on resending and then ultimately fail.
    req.sent = 1;//end express session
    console.log("--------------------------------");
  }

  req.dom.page = "/webhook";//setting page will be at the end before timeout, because it has coookies information that gets updated by the middleware before it.
  next();
});

app.use((req, res, next) => {
  if(req.cookies.user) console.log("user:", req.cookies.user); //only log the loggedin user, otherwise spam bots also log.
  if(req.cookies.user) console.log("time:", Date.now()); //only log the loggedin user, otherwise spam bots also log.
  if(req.cookies.user) console.log("page:", req.url); //only log the loggedin user, otherwise spam bots also log.
  if(req.cookies.user) console.log("form:", req.body); //only log the loggedin user, otherwise spam bots also log.
  if(req.cookies.user) console.log("dom:", req.dom); //only log the loggedin user, otherwise spam bots also log.
  if(req.cookies.user) gun.get("users").get(req.cookies.user).put(array2object(req.dom));//always use array2object for arrayed object. //only log the loggedin user, otherwise spam bots also log.
  
  let dom = `
    <!DOCTYPE html> 
    <html lang="en">
      <head>
        <!-- there are 7 metadata (non-displayed informational data) tags inside head tag:
        1. Title (Displays Title on the Browser Tab. Important from SEO perspective because it gets indexed and displayed in Search Engine results)
        2. Meta (mainly for charset, keywords, description, viewport, author, xss domains, cache refresh, and few other minor settings)
        3. Link (mostly for external css or favicon using rel="stylesheet/icon", and few other minor settings)
        4. Base (to set base url, set automatically so never used)
        5. Style (style/css should be in head tags not in body tag at the end. 1. Because it is metadata, not data. 2. It helps avoid position/color/font glitches while html loads progressively)
        6. Script (No need to set type="text/js" as it is default. No need to set src="" as this is not an external library. No need to set async/defer as it requries src attribute also. No need to set async/defer as your requirement is to execute js after html is parsed and htmlload event absolutely meets your requirements)
        7. Noscript (execute if no javascript is enabled. Ignore this tag.)
        -->
        <title>VISTEK Vehicle Information System</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Vehicle Identification System - VISTEK.">
        <meta name="keywords" content="vistek, vehicle information system, dvla, hpicheck, vdicheck">
        <meta name="author" content="VISTEK - Vehicle Information System">
        <link rel="icon" type="image/jpg" href="/favicon.jpg">
        <!-- style tag is required before body so that the layout does not constantly glitch during loading -->
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
          * {
          overflow-x: hidden;
          }
          body{
            margin:0;
            padding:0;
            box-sizing:border-box;
            font-family:'Roboto',sans-serif;
            font-size:1rem;
            color:black;
            background-color:white;
            width:100%;
          }
          ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
            color: black;
            opacity: 1; /* Firefox */
          }
          ::-ms-input-placeholder { /* Microsoft Edge */
            color: black;
          }
          a{
            color:inherit; 
            text-decoration: inherit;
          } 
          .reportfull{
            grid-gap:0.5rem;
          }
          @media all and (max-width: 550px){
            html {
              scroll-padding-top:4rem; /* height of sticky header */
            }
            .grid{
              display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));gap:0.5rem;width:96%;
            }
            .grid2{
              display:grid;grid-auto-flow:row;
            }
            .homebannerbg{
              grid-template-rows:0fr 1fr 0fr 1fr 3fr;
              background-image:url("background.jpg");
              background-color: #3079be;
              background-position: 20% center;
              background-size:cover;
            }
            .dashboardmenu{
              justify-content:stretch;
            }
            .dashboardmenutitle{
              font-size:1rem;
            }
           .dashboardreportbalances{
              grid-auto-flow: row;
              justify-content: center;
            }
            .dashboardbalances{
              grid-auto-flow: row;
              justify-content: center;
            }
            .logo{
              width:64px;
              height:51px;
            }
            .form{
              width:90vw;
            }
            .homebanner{
              margin-top:67px;
            }
            .contact{
              margin-top:4rem;
            }
            .contactenvelopeimage {
              width:100%;
            }
            .about{
              margin-top:4rem;
            }
            .aboutgenuine{
              grid-template-rows: auto auto;
            }
            .aboutvalues{
              grid-template-rows: auto auto;
            }
            .aboutfuture{
              grid-template-rows: auto auto;
            }
            .terms{
              margin-top:4rem;
            }
            .privacy{
              margin-top:4rem;
            }
            .checkoutpage{
              margin-top:4rem;
              width:96vw;
            }
            .dashboard{
              margin-top:4rem;
            }
            .details{
              width:96vw;
            }
            .cookieclose{
              margin: 0 1rem 0 1rem;
            }
            .footer {
              display:grid;
              justify-items:start;
            }
            .footersection1 {
              display:grid;
              grid-auto-flow:row;
            }
          }
          @media all and (min-width: 551px){
            .grid{
              display:grid;grid-template-columns:repeat(auto-fit,minmax(0,auto));gap:0.5rem;width:96%;
            }
            .grid2{
              display:grid;grid-auto-flow:column;
            }
            .homebannerbg{
              grid-template-rows:1fr 2fr 1fr 2fr 15fr;
              background-image:url("background.jpg");
              background-color: #3079be;
              background-position: center center;
            }
            .dashboardmenu{
              justify-content:space-between;
            }
            .dashboardmenutitle{
              font-size:1.5rem;
            }
            .dashboardreportbalances{
              grid-auto-flow:column;
              justify-content: start;
            }
           .dashboardbalances{
              grid-auto-flow:column;
              justify-content: start;
            }
            .form{
              width:30vw;
            }
            .details{
              display:grid;
              justify-items:center;
              justify-self:center;
              width:80vw;
            }
            .home {
              margin-top: 4rem;
            }
            .dashboard {
              margin-top: 4rem;
            }
            .accountlogin{
              width:100%;
            }
            .about {
              margin-top: 4rem;
            }
            .terms {
              margin-top: 4rem;
            }
            .contact {
              margin-top: 4rem;
            }
            .privacy {
              margin-top: 4rem;
            }
            .accountregister{
              width:100%;
            }
            .accountreset{
              width:100%;
            }
            .aboutgenuine{
              grid-template-columns: 1fr 1fr;
            }
            .aboutvalues{
              grid-template-columns: 2fr 1fr;
            }
            .aboutfuture{
              grid-template-columns: 1fr 1fr;
            }
            .cookieclose{
              margin: 0 2rem 0 1rem;
            }
            .footer {
              display:grid;
              justify-items:center;
            }
            .footersection1 {
              display:grid;
              grid-auto-flow:column;
              width:100%;
            }
          }
        </style>
        <script defer>
          let dom = {};
          window.addEventListener("load",()=>{
            let perfEntries = performance.getEntriesByType("navigation");
            if (perfEntries[0].type === "back_forward") {
              location.reload(true);
            }
            if ((window.location.pathname=="/dashboard/reports" || window.location.pathname=="/account/login" || window.location.pathname=="/admin") && window.history.replaceState ) {
              window.history.replaceState( null, null, window.location.href );
            }

            dom = ${JSON.stringify(req.dom)};
            console.log({"dom": dom});

            if(dom.page == "/"){
              window.document.querySelector(".home").style.display = "grid";
            }
            if(dom.page == "/account/login"){
              window.document.querySelector(".account").style.display = "grid";
              window.document.querySelector(".accountlogin").style.display = "grid";
              window.document.querySelector(".accountmenulogin").style.color = "#2f2e2a";
              window.document.querySelector(".accountmenulogin").style.backgroundColor = "#f9d441";
            }
            if(dom.page == "/account/register"){
              window.document.querySelector(".account").style.display = "grid";
              window.document.querySelector(".accountregister").style.display = "grid";
              window.document.querySelector(".accountmenuregister").style.color = "#2f2e2a";
              window.document.querySelector(".accountmenuregister").style.backgroundColor = "#f9d441";
            }
            if(dom.page == "/account/reset"){
              window.document.querySelector(".account").style.display = "grid";
              window.document.querySelector(".accountreset").style.display = "grid";
              window.document.querySelector(".accountmenureset").style.color = "#2f2e2a";
              window.document.querySelector(".accountmenureset").style.backgroundColor = "#f9d441";
            }
            if(dom.page == "/dashboard/reports"){
              window.document.querySelector(".dashboard").style.display = "grid";
              window.document.querySelector(".dashboardreports").style.display = "grid";
              window.document.querySelector(".dashboardmenutabsreports").style.color = "#2f2e2a";
              window.document.querySelector(".dashboardmenutabsreports").style.backgroundColor = "#f9d441";
            }
            if(dom.page == "/dashboard/balance"){
              window.document.querySelector(".dashboard").style.display = "grid";
              window.document.querySelector(".dashboardbalance").style.display = "grid";
              window.document.querySelector(".dashboardmenutabsbalance").style.color = "#2f2e2a";
              window.document.querySelector(".dashboardmenutabsbalance").style.backgroundColor = "#f9d441";
            }
            if(dom.page == "/dashboard/profile"){
              window.document.querySelector(".dashboard").style.display = "grid";
              window.document.querySelector(".dashboardprofile").style.display = "grid";
              window.document.querySelector(".dashboardmenutabsprofile").style.color = "#2f2e2a";
              window.document.querySelector(".dashboardmenutabsprofile").style.backgroundColor = "#f9d441";
            }
            if(dom.page == "/admin"){
              window.document.querySelector(".admin").style.display = "grid";
            }
            if(dom.page == "/report"){
              window.document.querySelector(".report").style.display = "grid";
            }
            if(dom.page == "/contact"){
              window.document.querySelector(".contact").style.display = "grid";
            }
            if(dom.page == "/about"){
              window.document.querySelector(".about").style.display = "grid";
            }
            if(dom.page == "/privacy"){
              window.document.querySelector(".privacy").style.display = "grid";
            }
            if(dom.page == "/terms"){
              window.document.querySelector(".terms").style.display = "grid";
            }
            if(dom.page == "/checkout"){
              window.document.querySelector(".checkoutpage").style.display = "grid";
            }
            
            if(dom.home.banner.bg.message.text) {
              window.document.querySelector('.homebannerbgmessage').style.display = 'grid'; 
              window.document.querySelector('.homebannerbgmessage').innerHTML = dom.home.banner.bg.message.text; 
              window.document.querySelector('.homebannerbgmessage').style.color = dom.home.banner.bg.message.color; 
              window.document.querySelector('.homebannerbgmessage').style.fontWeight = 'bold'; 
              window.document.querySelector('.homebannerbgmessage').style.fontSize = '2rem';
            }

            if (!dom.account.login.status) {
              window.document.querySelector(".navlogin").style.display = "grid";
              window.document.querySelector(".moblogin").style.display = "grid";
            }
            if (dom.account.login.status) {
              window.document.querySelector(".navlogout").style.display = "grid";
              window.document.querySelector(".moblogout").style.display = "grid";
              window.document.querySelector(".homedashboard").style.display = "grid";
              window.document.querySelector(".navmobdashboard").style.display = "grid";
            }

            if (dom.account.login.role){
              window.document.querySelector(".homeadmin").style.display = "grid";
              window.document.querySelector(".navmobadmin").style.display = "grid";
            }
          
            if (dom.account.login.message.text) {
              window.document.querySelector(".accountloginmessage").style.display = "grid";
              window.document.querySelector(".accountloginmessage").innerHTML = dom.account.login.message.text;
              window.document.querySelector(".accountloginmessage").style.color = dom.account.login.message.color;
            }

            if (dom.account.register.message.text) {
              window.document.querySelector(".accountregistermessage").style.display = "grid";
              window.document.querySelector(".accountregistermessage").innerHTML = dom.account.register.message.text;
              window.document.querySelector(".accountregistermessage").style.color = dom.account.register.message.color;
            }

            if (dom.account.reset.message.text) {
              window.document.querySelector(".accountresetmessage").style.display = "grid";
              window.document.querySelector(".accountresetmessage").innerHTML = dom.account.reset.message.text;
              window.document.querySelector(".accountresetmessage").style.color = dom.account.reset.message.color;
            }
            
            if (dom.dashboard.reports.balance.message.text) {
              window.document.querySelector(".dashboardreportsbalancemessage").style.display = "grid";
              window.document.querySelector(".dashboardreportsbalancemessage").innerHTML = dom.dashboard.reports.balance.message.text;
              window.document.querySelector(".dashboardreportsbalancemessage").style.color = dom.dashboard.reports.balance.message.color;
            }
            
            if (dom.dashboard.reports.add.message.text) {
              window.document.querySelector(".dashboardaddmessage").style.display = "grid";
              window.document.querySelector(".dashboardaddmessage").innerHTML = dom.dashboard.reports.add.message.text;
              window.document.querySelector(".dashboardaddmessage").style.color = dom.dashboard.reports.add.message.color;
            }
            
            if (dom.dashboard.reports.search.message.text) {
              window.document.querySelector(".dashboardsearchmessage").style.display = "grid";
              window.document.querySelector(".dashboardsearchmessage").innerHTML = dom.dashboard.reports.search.message.text;
              window.document.querySelector(".dashboardsearchmessage").style.color = dom.dashboard.reports.search.message.color;
            }
          
            if (dom.dashboard.reports.cars && Object.values(dom.dashboard.reports.cars).length) {
              let cars = dom.dashboard.reports.cars;
              if (dom.dashboard.reports.search.regno) {
                let searchtemp = cars[dom.dashboard.reports.search.regno];
                cars = {};
                cars[dom.dashboard.reports.search.regno] = searchtemp;
              }
              window.document.querySelector(".dashboardreportsrecords").innerHTML = "";
              Object.keys(cars).sort((a, b) => { return cars[b].timestamp - cars[a].timestamp }).forEach(function (key) {
                let dashboardreportsrecordtemplate = window.document.querySelector(".dashboardreportsrecordtemplate").cloneNode(true); //// true: clone this node and also its decendents. false: clone this node but not its descendents.
                dashboardreportsrecordtemplate.querySelector(".dashboardregno").innerHTML = key;
                dashboardreportsrecordtemplate.querySelector(".dashboardreportfree").setAttribute("value", key + "-free");
                dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").setAttribute("value", key + "-basic");
                dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").setAttribute("value", key + "-full");
                if (cars[key].basic) dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").style.color = "purple";
                if (cars[key].full) dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").style.color = "purple";
                if (!dom.dashboard.balance.basic && !cars[key].basic) {
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").setAttribute("name","dashboardreportsbalanceaddbasic");
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").setAttribute("form","dashboardreportsbalance");
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").setAttribute("value",key+"-basic");
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").style.color = "#b39932";
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportbasic").setAttribute("onclick","return true;");
                }
                if (!dom.dashboard.balance.full && !cars[key].full) {
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").setAttribute("name","dashboardreportsbalanceaddfull");
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").setAttribute("form","dashboardreportsbalance");
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").setAttribute("value",key+"-full");
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").style.color = "#b39932";
                  dashboardreportsrecordtemplate.querySelector(".dashboardreportfull").setAttribute("onclick","return true;");
                }
                window.document.querySelector(".dashboardreportsrecords").appendChild(dashboardreportsrecordtemplate);
              });
            }
          
            if (dom.dashboard.balance.basic) {
              window.document.querySelector(".dashboardbalancebasic").innerHTML = dom.dashboard.balance.basic;
              window.document.querySelector(".dashboardreportbalancebasic").innerHTML = dom.dashboard.balance.basic;
            }
            
            if (dom.dashboard.balance.full) {
              window.document.querySelector(".dashboardbalancefull").innerHTML = dom.dashboard.balance.full;
              window.document.querySelector(".dashboardreportbalancefull").innerHTML = dom.dashboard.balance.full;
            }

            if (dom.dashboard.balance.transactions && Object.keys(dom.dashboard.balance.transactions).length) {
              window.document.querySelector(".dashboardbalancetransactionsdetailstemplatetitle").style.display = "grid";
              window.document.querySelector(".dashboardbalancetransactionsdetails").innerHTML = "";
              Object.values(dom.dashboard.balance.transactions).sort((a,b)=>{return b.time - a.time}).forEach((item, index) => {
                let dashboardbalancetransactionsdetailstemplate = window.document.querySelector(".dashboardbalancetransactionsdetailstemplate").cloneNode("true");// true: clone this node and also its decendents. false: clone this node but not its descendents.
                // dashboardbalancetransactionsdetailstemplate.style.display = "grid";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldstime").innerHTML = item.time != null ? new Date(item.time).toLocaleString("en-gb") : "-";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldspackage").innerHTML = item.package != null ? item.package : "-";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldsvehicleinput").value = item.vehicle != null ? item.vehicle : "-";
                if (item.vehicle != null) dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldsvehicleinput").style.color = "#f9d441";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldscharges").innerHTML = item.charges != null ? "£"+item.charges : "-";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldscredits").innerHTML = item.credits != null ? item.credits : "-";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldsbalancebasic").innerHTML = item.balancebasic != null ? item.balancebasic : "-";
                dashboardbalancetransactionsdetailstemplate.querySelector(".dashboardbalancetransactionsdetailstemplatefieldsbalancefull").innerHTML = item.balancefull != null ? item.balancefull : "-";
                window.document.querySelector(".dashboardbalancetransactionsdetails").appendChild(dashboardbalancetransactionsdetailstemplate);
              });
            }

            if (dom.dashboard.balance.message.text) {
              window.document.querySelector(".dashboardbalancemessage").style.display = "grid";
              window.document.querySelector(".dashboardbalancemessage").innerHTML = dom.dashboard.balance.message.text;
              window.document.querySelector(".dashboardbalancemessage").style.color = dom.dashboard.balance.message.color;
            }
            
            if (dom.dashboard.profile.name) {
              window.document.querySelector(".dashboardwelcomename").innerHTML = dom.dashboard.profile.name.toUpperCase();
              window.document.querySelector(".dashboardprofilenamenew").setAttribute("value", dom.dashboard.profile.name);
            }
            if (dom.dashboard.profile.email) {
              window.document.querySelector(".dashboardemailcurrent").setAttribute("value", dom.dashboard.profile.email);
              window.document.querySelector(".dashboardprofileemailnew").setAttribute("value", dom.dashboard.profile.email);
            }  
            if(dom.dashboard.profile.contact) window.document.querySelector(".dashboardprofilecontactnew").setAttribute("value", dom.dashboard.profile.contact);
          
            if (dom.dashboard.profile.message.text) {
              window.document.querySelector(".dashboardprofilemessage").style.display = "grid";
              window.document.querySelector(".dashboardprofilemessage").innerHTML = dom.dashboard.profile.message.text;
              window.document.querySelector(".dashboardprofilemessage").style.color = dom.dashboard.profile.message.color;
            }

            if (dom.report.dvla) {
              window.document.querySelectorAll(".reportregno").forEach((element,index)=>{
                element.innerHTML = dom.report.dvla.registrationNumber ? dom.report.dvla.registrationNumber : "NO RECORD AVAILABLE";
              });
              window.document.querySelector(".reportid").innerHTML = dom.report.dvla.registrationNumber ? "Report ID: "+dom.report.dvla.registrationNumber+"-"+((new Date()).getMonth()+1)+"-"+(new Date()).getFullYear() : "Report ID: NOT AVAILABLE";
              window.document.querySelector(".date").innerHTML = dom.report.dvla.registrationNumber ? "Date: "+(new Date()).getDate()+"-"+((new Date()).getMonth()+1)+"-"+(new Date()).getFullYear() : "Date: NOT AVAILABLE";
              window.document.querySelector(".make").innerHTML = dom.report.dvla.make ? dom.report.dvla.make : "NOT AVAILABLE";
              window.document.querySelector(".year").innerHTML = dom.report.dvla.yearOfManufacture ? dom.report.dvla.yearOfManufacture : "NOT AVAILABLE";
              window.document.querySelector(".firstreg").innerHTML = dom.report.dvla.monthOfFirstRegistration ? dom.report.dvla.monthOfFirstRegistration : "NOT AVAILABLE";
              window.document.querySelector(".color").innerHTML = dom.report.dvla.colour ? dom.report.dvla.colour : "NOT AVAILABLE";
              window.document.querySelector(".enginetype").innerHTML = dom.report.dvla.engineCapacity ? dom.report.dvla.engineCapacity : "NOT AVAILABLE";
              window.document.querySelector(".fueltype").innerHTML = dom.report.dvla.fuelType ? dom.report.dvla.fuelType : "NOT AVAILABLE";
              window.document.querySelector(".wheelplan").innerHTML = dom.report.dvla.wheelplan ? dom.report.dvla.wheelplan : "NOT AVAILABLE";
              window.document.querySelector(".co2emissions").innerHTML = dom.report.dvla.co2Emissions ? dom.report.dvla.co2Emissions : "NOT AVAILABLE";
              window.document.querySelector(".eurostatus").innerHTML = dom.report.dvla.euroStatus ? dom.report.dvla.euroStatus : "NOT AVAILABLE";
              window.document.querySelector(".export").innerHTML = dom.report.dvla.markedForExport ? dom.report.dvla.markedForExport : "NOT AVAILABLE";
              window.document.querySelector(".revenueweight").innerHTML = dom.report.dvla.revenueWeight ? dom.report.dvla.revenueWeight : "NOT AVAILABLE";
              window.document.querySelector(".typeapproval").innerHTML = dom.report.dvla.typeApproval ? dom.report.dvla.typeApproval : "NOT AVAILABLE";
              window.document.querySelector(".motstatus").innerHTML = dom.report.dvla.motStatus ? dom.report.dvla.motStatus : "NOT AVAILABLE";
              window.document.querySelector(".taxdue").innerHTML = dom.report.dvla.taxDueDate ? dom.report.dvla.taxDueDate : "NOT AVAILABLE";
              window.document.querySelector(".taxstatus").innerHTML = dom.report.dvla.taxStatus ? dom.report.dvla.taxStatus : "NOT AVAILABLE";
              window.document.querySelector(".v5c").innerHTML = dom.report.dvla.dateOfLastV5CIssued ? dom.report.dvla.dateOfLastV5CIssued : "NOT AVAILABLE";
            }

            if (dom.report.dvla == "error"){
              window.document.querySelector(".reportmain").style.display = "none";
              window.document.querySelector(".reporterror").style.display = "grid";
              window.document.querySelectorAll(".reportregno").forEach((element,index)=>{
                element.innerHTML = dom.report.regno ? dom.report.regno : "NOT AVAILABLE";
              });
            }

            if (!dom.report.basic) {
              window.document.querySelector(".basicsection").style.display = "none";
              window.document.querySelector(".basicsectionunregistered").style.display = "grid";
            }

            if (dom.report.vehicleandmothistory.VehicleRegistration) {
              window.document.querySelector(".basicregistrationvrm").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Vrm;
              window.document.querySelector(".basicregistrationfirstregistered").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DateFirstRegistered != null ? dom.report.vehicleandmothistory.VehicleRegistration.DateFirstRegistered : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationfirstregistereduk").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DateFirstRegisteredUk != null? dom.report.vehicleandmothistory.VehicleRegistration.DateFirstRegisteredUk : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationdatelastupdate").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DateOfLastUpdate != null? dom.report.vehicleandmothistory.VehicleRegistration.DateOfLastUpdate : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationvehicleusedbeforeregistration").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.VehicleUsedBeforeFirstRegistration != null? dom.report.vehicleandmothistory.VehicleRegistration.VehicleUsedBeforeFirstRegistration : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationvehicleyearmonthfirstregistered").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.YearMonthFirstRegistered != null? dom.report.vehicleandmothistory.VehicleRegistration.YearMonthFirstRegistered : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationyearofmanufacture").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.YearOfManufacture != null? dom.report.vehicleandmothistory.VehicleRegistration.YearOfManufacture : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationmake").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Make != null? dom.report.vehicleandmothistory.VehicleRegistration.Make : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationmakemodel").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.MakeModel != null? dom.report.vehicleandmothistory.VehicleRegistration.MakeModel : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationmodel").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Model != null? dom.report.vehicleandmothistory.VehicleRegistration.Model : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationmvrismakecode").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.MvrisMakeCode != null? dom.report.vehicleandmothistory.VehicleRegistration.MvrisMakeCode : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationmvrismodelcode").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.MvrisModelCode != null? dom.report.vehicleandmothistory.VehicleRegistration.MvrisModelCode : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationvehicleclass").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.VehicleClass != null? dom.report.vehicleandmothistory.VehicleRegistration.VehicleClass : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationco2emissions").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Co2Emissions != null? dom.report.vehicleandmothistory.VehicleRegistration.Co2Emissions : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationcolor").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Colour != null? dom.report.vehicleandmothistory.VehicleRegistration.Colour : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationdoorplan").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DoorPlan != null? dom.report.vehicleandmothistory.VehicleRegistration.DoorPlan : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationdoorplanliteral").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DoorPlanLiteral != null? dom.report.vehicleandmothistory.VehicleRegistration.DoorPlanLiteral : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationenginecapacity").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.EngineCapacity != null? dom.report.vehicleandmothistory.VehicleRegistration.EngineCapacity : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationenginenumber").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.EngineNumber != null? dom.report.vehicleandmothistory.VehicleRegistration.EngineNumber : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationfueltype").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.FuelType != null? dom.report.vehicleandmothistory.VehicleRegistration.FuelType : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationmaxpermissiblemass").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.MaxPermissibleMass ? dom.report.vehicleandmothistory.VehicleRegistration.MaxPermissibleMass : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationgearcount").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.GearCount != null? dom.report.vehicleandmothistory.VehicleRegistration.GearCount : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationgrossweight").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.GrossWeight != null? dom.report.vehicleandmothistory.VehicleRegistration.GrossWeight : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationseatingcapacity").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.SeatingCapacity != null? dom.report.vehicleandmothistory.VehicleRegistration.SeatingCapacity : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationtransmission").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Transmission != null? dom.report.vehicleandmothistory.VehicleRegistration.Transmission : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationtransmissioncode").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.TransmissionCode != null? dom.report.vehicleandmothistory.VehicleRegistration.TransmissionCode : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationtransmissiontype").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.TransmissionType != null? dom.report.vehicleandmothistory.VehicleRegistration.TransmissionType : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationwheelplan").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.WheelPlan != null? dom.report.vehicleandmothistory.VehicleRegistration.WheelPlan : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationimported").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Imported != null? dom.report.vehicleandmothistory.VehicleRegistration.Imported : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationimportnoneu").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.ImportNonEu != null? dom.report.vehicleandmothistory.VehicleRegistration.ImportNonEu : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationexported").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Exported != null? dom.report.vehicleandmothistory.VehicleRegistration.Exported : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationdateexported").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DateExported != null? dom.report.vehicleandmothistory.VehicleRegistration.DateExported : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationscrapped").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Scrapped != null? dom.report.vehicleandmothistory.VehicleRegistration.Scrapped : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationdatescrapped").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.DateScrapped != null? dom.report.vehicleandmothistory.VehicleRegistration.DateScrapped : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationcertificateofdestructionissued").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.CertificateOfDestructionIssued != null? dom.report.vehicleandmothistory.VehicleRegistration.CertificateOfDestructionIssued : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationpreviousvrmgb").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.PreviousVrmGb != null? dom.report.vehicleandmothistory.VehicleRegistration.PreviousVrmGb : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationpreviousvrmni").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.PreviousVrmNi != null? dom.report.vehicleandmothistory.VehicleRegistration.PreviousVrmNi : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationvin").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.Vin != null? dom.report.vehicleandmothistory.VehicleRegistration.Vin : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationvinconfirmationflag").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.VinConfirmationFlag != null? dom.report.vehicleandmothistory.VehicleRegistration.VinConfirmationFlag : "NOT AVAILABLE";
              window.document.querySelector(".basicregistrationvinlast5").innerHTML = dom.report.vehicleandmothistory.VehicleRegistration.VinLast5 != null? dom.report.vehicleandmothistory.VehicleRegistration.VinLast5 : "NOT AVAILABLE";
            }
            
            if (dom.report.vehicleandmothistory.MotHistory.RecordList) {
              dom.report.vehicleandmothistory.MotHistory.RecordList = Object.keys(dom.report.vehicleandmothistory.MotHistory.RecordList).map((key) => dom.report.vehicleandmothistory.MotHistory.RecordList[key]);//converts from numbered object to object array.
              window.document.querySelector(".reportbasicmotrecords").innerHTML = "";
              dom.report.vehicleandmothistory.MotHistory.RecordList.forEach((item,index)=>{
                let reportbasicmotrecordtemplate = window.document.querySelector(".reportbasicmotrecordtemplate").cloneNode("true");// true: clone this node and also its decendents. false: clone this node but not its descendents.
                reportbasicmotrecordtemplate.style.display = "grid";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmottestnumber").innerHTML = item.TestNumber != null ? item.TestNumber : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmottestdate").innerHTML = item.TestDate != null ? item.TestDate : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotexpirydate").innerHTML = item.ExpiryDate != null ? item.ExpiryDate : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmottestresult").innerHTML = item.TestResult != null ? item.TestResult : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotodometerreading").innerHTML = item.OdometerReading != null ? item.OdometerReading : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotodometerunit").innerHTML = item.OdometerUnit != null ? item.OdometerUnit : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotodometerinkilometers").innerHTML = item.OdometerInKilometers != null ? item.OdometerInKilometers : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotodometerinmiles").innerHTML = item.OdometerInMiles != null ? item.OdometerInMiles : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotmileagesincelastpass").innerHTML = item.MileageSinceLastPass != null ? item.MileageSinceLastPass : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotmileageanomalydetected").innerHTML = item.MileageAnomalyDetected != null ? item.MileageAnomalyDetected : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotdayssincelastpass").innerHTML = item.DaysSinceLastPass != null ? item.DaysSinceLastPass : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotdayssincelasttest").innerHTML = item.DaysSinceLastTest != null ? item.DaysSinceLastTest : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotdaysoutofmot").innerHTML = item.DaysOutOfMot != null ? item.DaysOutOfMot : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotisretest").innerHTML = item.IsRetest != null ? item.IsRetest : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotadvisorynoticecount").innerHTML = item.AdvisoryNoticeCount != null ? item.AdvisoryNoticeCount : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotdangerousfailurecount").innerHTML = item.DangerousFailureCount != null ? item.DangerousFailureCount : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotmajorfailurecount").innerHTML = item.MajorFailureCount != null ? item.MajorFailureCount : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmothasextensionperiod").innerHTML = item.HasExtensionPeriod != null ? item.HasExtensionPeriod : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotextensionperiodreason").innerHTML = item.ExtensionPeriodReason != null ? item.ExtensionPeriodReason : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotextensionperiodadditionaldays").innerHTML = item.ExtensionPeriodAdditionalDays != null ? item.ExtensionPeriodAdditionalDays : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotextensionperiodoriginalduedate").innerHTML = item.ExtensionPeriodOriginalDueDate != null ? item.ExtensionPeriodOriginalDueDate : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotadvisorynoticelist").innerHTML = Object.keys(item.AdvisoryNoticeList).length  != 0 ? item.AdvisoryNoticeList : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotfailurereasonlist").innerHTML = Object.keys(item.FailureReasonList).length  != 0 ? item.FailureReasonList : "NOT AVAILABLE";
                reportbasicmotrecordtemplate.querySelector(".reportbasicmotannotationdetailslist").innerHTML = Object.keys(item.AnnotationDetailsList).length  != 0 ? item.AnnotationDetailsList : "NOT AVAILABLE";
                window.document.querySelector(".reportbasicmotrecords").appendChild(reportbasicmotrecordtemplate);
              })
            }

            if(dom.report.valuation){
              window.document.querySelector(".basicsection").style.display = "grid";
              window.document.querySelector(".basicsectionunregistered").style.display = "none";
              window.document.querySelector(".otr").innerHTML = dom.report.valuation.ValuationList.OTR ? "£ " + dom.report.valuation.ValuationList.OTR.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".dealerforecourt").innerHTML = dom.report.valuation.ValuationList.DealerForecourt ? "£ " + dom.report.valuation.ValuationList.DealerForecourt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".traderetail").innerHTML = dom.report.valuation.ValuationList.TradeRetail ? "£ " + dom.report.valuation.ValuationList.TradeRetail.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".privateclean").innerHTML = dom.report.valuation.ValuationList.PrivateClean ? "£ " + dom.report.valuation.ValuationList.PrivateClean.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".privateaverage").innerHTML = dom.report.valuation.ValuationList.PrivateAverage ? "£ " + dom.report.valuation.ValuationList.PrivateAverage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".partexchange").innerHTML = dom.report.valuation.ValuationList.PartExchange ? "£ " + dom.report.valuation.ValuationList.PartExchange.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".auction").innerHTML = dom.report.valuation.ValuationList.Auction ? "£ " + dom.report.valuation.ValuationList.Auction.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".tradeaverage").innerHTML = dom.report.valuation.ValuationList.TradeAverage ? "£ " + dom.report.valuation.ValuationList.TradeAverage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".tradepoor").innerHTML = dom.report.valuation.ValuationList.TradePoor ? "£ " + dom.report.valuation.ValuationList.TradePoor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "NOT AVAILABLE";
              window.document.querySelector(".vrm").innerHTML = dom.report.valuation.Vrm ? dom.report.valuation.Vrm : "NOT AVAILABLE";
              window.document.querySelector(".mileage").innerHTML = dom.report.valuation.Mileage ? dom.report.valuation.Mileage : "NOT AVAILABLE";
              window.document.querySelector(".plateyear").innerHTML = dom.report.valuation.PlateYear ? dom.report.valuation.PlateYear : "NOT AVAILABLE";
              window.document.querySelector(".valuationtime").innerHTML = dom.report.valuation.ValuationTime ? dom.report.valuation.ValuationTime : "NOT AVAILABLE";
              window.document.querySelector(".vehicledescription").innerHTML = dom.report.valuation.VehicleDescription ? dom.report.valuation.VehicleDescription : "NOT AVAILABLE";
              window.document.querySelector(".valuationbook").innerHTML = dom.report.valuation.ValuationBook ? dom.report.valuation.ValuationBook : "NOT AVAILABLE";
              window.document.querySelector(".extractnumber").innerHTML = dom.report.valuation.ExtractNumber ? dom.report.valuation.ExtractNumber : "NOT AVAILABLE";
            }
            
            if(!dom.report.full){
              window.document.querySelector(".reportfull").style.display = "none";
              window.document.querySelector(".reportfullunregistered").style.display = "grid";
            }

            if(dom.report.full){
              window.document.querySelector(".reportfull").style.display = "grid";
              window.document.querySelector(".reportfullunregistered").style.display = "none";
              window.document.querySelector(".vrm3").innerHTML = dom.report.full.Vrm ? dom.report.full.Vrm : "NOT AVAILABLE";
              window.document.querySelector(".model3").innerHTML = dom.report.full.Model ? dom.report.full.Model : "NOT AVAILABLE";
              window.document.querySelector(".fuel3").innerHTML = dom.report.full.FuelType ? dom.report.full.FuelType : "NOT AVAILABLE";
              window.document.querySelector(".make3").innerHTML = dom.report.full.Make ? dom.report.full.Make : "NOT AVAILABLE";
              window.document.querySelector(".engine3").innerHTML = dom.report.full.EngineCapacity ? dom.report.full.EngineCapacity : "NOT AVAILABLE";
              window.document.querySelector(".color3").innerHTML = dom.report.full.Colour ? dom.report.full.Colour : "NOT AVAILABLE";
              window.document.querySelector(".yearofmanufacture").innerHTML = dom.report.full.YearOfManufacture ? dom.report.full.YearOfManufacture : "NOT AVAILABLE";
              window.document.querySelector(".firstregistered").innerHTML = dom.report.full.DateFirstRegistered ? dom.report.full.DateFirstRegistered : "NOT AVAILABLE";
              window.document.querySelector(".vinlast5").innerHTML = dom.report.full.VinLast5 ? dom.report.full.VinLast5 : "NOT AVAILABLE";
              window.document.querySelector(".writeoffrecordcount").innerHTML = dom.report.full.WriteOffRecordCount ? dom.report.full.WriteOffRecordCount : "NOT AVAILABLE";
              window.document.querySelector(".lookupstatusmessage").innerHTML = dom.report.full.LookupStatusMessage ? dom.report.full.LookupStatusMessage : "NOT AVAILABLE";
              window.document.querySelector(".mileagerecordcount").innerHTML = dom.report.full.MileageRecordCount ? dom.report.full.MileageRecordCount : "NOT AVAILABLE";
              window.document.querySelector(".importusedbeforeukregistration").innerHTML = dom.report.full.ImportUsedBeforeUkRegistration ? dom.report.full.ImportUsedBeforeUkRegistration : "NOT AVAILABLE";
              window.document.querySelector(".victestdate").innerHTML = dom.report.full.VicTestDate ? dom.report.full.VicTestDate : "NOT AVAILABLE";
              window.document.querySelector(".stoleninfosource").innerHTML = dom.report.full.StolenInfoSource ? dom.report.full.StolenInfoSource : "NOT AVAILABLE";
              window.document.querySelector(".previouscolor").innerHTML = dom.report.full.PreviousColour ? dom.report.full.PreviousColour : "NOT AVAILABLE";
              window.document.querySelector(".stolenstatus").innerHTML = dom.report.full.StolenStatus ? dom.report.full.StolenStatus : "NOT AVAILABLE";
              window.document.querySelector(".previouskeepercount").innerHTML = dom.report.full.PreviousKeeperCount ? dom.report.full.PreviousKeeperCount : "NOT AVAILABLE";
              window.document.querySelector(".writeoffdate").innerHTML = dom.report.full.WriteOffDate ? dom.report.full.WriteOffDate : "NOT AVAILABLE";
              window.document.querySelector(".importdate").innerHTML = dom.report.full.ImportDate ? dom.report.full.ImportDate : "NOT AVAILABLE";
              window.document.querySelector(".stolenpoliceforce").innerHTML = dom.report.full.StolenPoliceForce ? dom.report.full.StolenPoliceForce : "NOT AVAILABLE";
              window.document.querySelector(".lookupstatuscode").innerHTML = dom.report.full.LookupStatusCode ? dom.report.full.LookupStatusCode : "NOT AVAILABLE";
              window.document.querySelector(".certificateofdestruction").innerHTML = dom.report.full.CertificateOfDestructionIssued ? dom.report.full.CertificateOfDestructionIssued : "NOT AVAILABLE";
              window.document.querySelector(".data").innerHTML = dom.report.full.Data ? dom.report.full.Data : "NOT AVAILABLE";
              window.document.querySelector(".writeoffcategory").innerHTML = dom.report.full.WriteOffCategory ? dom.report.full.WriteOffCategory : "NOT AVAILABLE";
              window.document.querySelector(".colorchangecount").innerHTML = dom.report.full.ColourChangeCount ? dom.report.full.ColourChangeCount : "NOT AVAILABLE";
              window.document.querySelector(".highriskrecordcount").innerHTML = dom.report.full.HighRiskRecordCount ? dom.report.full.HighRiskRecordCount : "NOT AVAILABLE";
              window.document.querySelector(".importedfromoutsideeu").innerHTML = dom.report.full.ImportedFromOutsideEu ? dom.report.full.ImportedFromOutsideEu : "NOT AVAILABLE";
              window.document.querySelector(".latestv5cissueddate").innerHTML = dom.report.full.LatestV5cIssuedDate ? dom.report.full.LatestV5cIssuedDate : "NOT AVAILABLE";
              window.document.querySelector(".stolen").innerHTML = dom.report.full.Stolen ? dom.report.full.Stolen : "NOT AVAILABLE";
              window.document.querySelector(".mileageanomalydetected").innerHTML = dom.report.full.MileageAnomalyDetected ? dom.report.full.MileageAnomalyDetected : "NOT AVAILABLE";
              window.document.querySelector(".previouskeepers").innerHTML = dom.report.full.PreviousKeepers ? dom.report.full.PreviousKeepers : "NOT AVAILABLE";
              window.document.querySelector(".victestresult").innerHTML = dom.report.full.VicTestResult ? dom.report.full.VicTestResult : "NOT AVAILABLE";
              window.document.querySelector(".dateoffirstregistrationinuk").innerHTML = dom.report.full.DateFirstRegisteredUk ? dom.report.full.DateFirstRegisteredUk : "NOT AVAILABLE";
              window.document.querySelector(".victested").innerHTML = dom.report.full.VicTested ? dom.report.full.VicTested : "NOT AVAILABLE";
              window.document.querySelector(".stolendate").innerHTML = dom.report.full.StolenDate ? dom.report.full.StolenDate : "NOT AVAILABLE";
              window.document.querySelector(".latestkeeperchangedate").innerHTML = dom.report.full.LatestKeeperChangeDate ? dom.report.full.LatestKeeperChangeDate : "NOT AVAILABLE";
              window.document.querySelector(".stolencontactnumber").innerHTML = dom.report.full.StolenContactNumber ? dom.report.full.StolenContactNumber : "NOT AVAILABLE";
              window.document.querySelector(".financerecordcount").innerHTML = dom.report.full.FinanceRecordCount ? dom.report.full.FinanceRecordCount : "NOT AVAILABLE";
              window.document.querySelector(".platechangecount").innerHTML = dom.report.full.PlateChangeCount ? dom.report.full.PlateChangeCount : "NOT AVAILABLE";
              window.document.querySelector(".scrapedate").innerHTML = dom.report.full.ScrapeDate ? dom.report.full.ScrapeDate : "NOT AVAILABLE";
              window.document.querySelector(".exportdate").innerHTML = dom.report.full.ExportDate ? dom.report.full.ExportDate : "NOT AVAILABLE";
              window.document.querySelector(".stolenmiaftrrecordcount").innerHTML = dom.report.full.StolenMiaftrRecordCount ? dom.report.full.StolenMiaftrRecordCount : "NOT AVAILABLE";
              window.document.querySelector(".transmissiontype").innerHTML = dom.report.full.TransmissionType ? dom.report.full.TransmissionType : "NOT AVAILABLE";
              window.document.querySelector(".scrapped").innerHTML = dom.report.full.Scrapped ? dom.report.full.Scrapped : "NOT AVAILABLE";
              window.document.querySelector(".writtenoff").innerHTML = dom.report.full.WrittenOff ? dom.report.full.WrittenOff : "NOT AVAILABLE";
              window.document.querySelector(".imported").innerHTML = dom.report.full.Imported ? dom.report.full.Imported : "NOT AVAILABLE";
              window.document.querySelector(".exported").innerHTML = dom.report.full.Exported ? dom.report.full.Exported : "NOT AVAILABLE";
              window.document.querySelector(".gearcount").innerHTML = dom.report.full.GearCount ? dom.report.full.GearCount : "NOT AVAILABLE";
            }
            
            if (dom.report.full && dom.report.full.FinanceRecordList && Object.keys(dom.report.full.FinanceRecordList).length) {
              dom.report.full.FinanceRecordList = Object.keys(dom.report.full.FinanceRecordList).map((key) => dom.report.full.FinanceRecordList[key]);//converts from numbered object to object array.
              window.document.querySelector(".financerecords").innerHTML = "";
              dom.report.full.FinanceRecordList.forEach((item,index)=>{
                let financerecordtemplate = window.document.querySelector(".financerecordtemplate").cloneNode("true");// true: clone this node and also its decendents. false: clone this node but not its descendents.
                financerecordtemplate.style.display = "grid";
                financerecordtemplate.querySelector(".agreementdate").innerHTML = item.AgreementDate ? item.AgreementDate : "NOT AVAILABLE";
                financerecordtemplate.querySelector(".agreementtype").innerHTML = item.AgreementType ? item.AgreementType : "NOT AVAILABLE";
                financerecordtemplate.querySelector(".agreementterm").innerHTML = item.AgreementTerm ? item.AgreementTerm : "NOT AVAILABLE";
                financerecordtemplate.querySelector(".agreementnumber").innerHTML = item.AgreementNumber ? item.AgreementNumber : "NOT AVAILABLE";
                financerecordtemplate.querySelector(".financecompany").innerHTML = item.FinanceCompany ? item.FinanceCompany : "NOT AVAILABLE";
                financerecordtemplate.querySelector(".contactnumber").innerHTML = item.ContactNumber ? item.ContactNumber : "NOT AVAILABLE";
                financerecordtemplate.querySelector(".vehicledescription3").innerHTML = item.VehicleDescription ? item.VehicleDescription : "NOT AVAILABLE";
                window.document.querySelector(".financerecords").appendChild(financerecordtemplate);
              })
            }
            
            if (dom.report.full && dom.report.full.MileageRecordList) {
              dom.report.full.MileageRecordList = Object.keys(dom.report.full.MileageRecordList).map((key) => dom.report.full.MileageRecordList[key]);//converts from numbered object to object array.
              window.document.querySelector(".mileagerecords").innerHTML = "";
              dom.report.full.MileageRecordList.forEach((item,index)=>{
                let mileagerecordtemplate = window.document.querySelector(".mileagerecordtemplate").cloneNode(true); //// true: clone this node and also its decendents. false: clone this node but not its descendents.
                mileagerecordtemplate.style.display = "grid";
                if (index != 0) {
                  mileagerecordtemplate.querySelector(".mileagerecordtemplatetitle").style.display = "none";
                }
                mileagerecordtemplate.querySelector(".mileagedate").innerHTML = item.DateOfInformation ? item.DateOfInformation : "NOT AVAILABLE";
                mileagerecordtemplate.querySelector(".mileagesource").innerHTML = item.SourceOfInformation ? item.SourceOfInformation : "NOT AVAILABLE";
                mileagerecordtemplate.querySelector(".mileagemileage").innerHTML = item.Mileage ? item.Mileage : "NOT AVAILABLE";
                window.document.querySelector(".mileagerecords").appendChild(mileagerecordtemplate);
              })
            }
            
            if(dom.report.full && dom.report.full.PlateChangeList) {
              dom.report.full.PlateChangeList = Object.keys(dom.report.full.PlateChangeList).map((key) => dom.report.full.PlateChangeList[key]);//converts from numbered object to object array.
              window.document.querySelector(".platerecords").innerHTML = "";
              dom.report.full.PlateChangeList.forEach((item,index)=>{
              let platerecordtemplate = window.document.querySelector(".platerecordtemplate").cloneNode(true); //// true: clone this node and also its decendents. false: clone this node but not its descendents.
              platerecordtemplate.style.display = "grid";
              platerecordtemplate.querySelector(".platepreviousvrm").innerHTML = item.PreviousVrm ? item.PreviousVrm : "NOT AVAILABLE";
              platerecordtemplate.querySelector(".platedatechanged").innerHTML = item.DateChanged ? item.DateChanged : "NOT AVAILABLE";
              window.document.querySelector(".platerecords").appendChild(platerecordtemplate);
              })
            }
            
            if (dom.contact.message.text) {
              window.document.querySelector(".contactmessage").style.display = "grid";
              window.document.querySelector(".contactmessage").innerHTML = dom.contact.message.text;
              window.document.querySelector(".contactmessage").style.color = dom.contact.message.color;
            }
            
            if (dom.checkout == "true") {
              window.document.querySelector(".checkoutmain").style.display = "none";
              window.document.querySelector(".checkoutmessage").style.display = "grid";
              window.document.querySelector(".checkoutmessagetrue").style.display = "grid";
              window.document.querySelector(".checkoutmessagefalse").style.display = "none";
            }
            
            if (dom.checkout == "false") {
              window.document.querySelector(".checkoutmain").style.display = "none";
              window.document.querySelector(".checkoutmessage").style.display = "grid";
              window.document.querySelector(".checkoutmessagetrue").style.display = "none";
              window.document.querySelector(".checkoutmessagefalse").style.display = "grid";
            }
          });
        </script>
      </head>
      <body>
        <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));">
          <div class="navbar reportprinthide">
            <div class="nav" style="display:none;justify-content:space-between;grid-template-columns:repeat(auto-fit,minmax(0,auto));margin:0;position:fixed;top:0;z-index:1;background:white;width:100%;">
              <div class="navlogo" style="margin:0.5rem;">
                <a href="/">
                  <img class="logo" src="/logo.jpg" style="width:4rem;background-color:grey;background-image:url('/logo.jpg');background-size:cover;" alt="vistek logo" loading="lazy">
                </a>
              </div>
              <div class="navmenu" style="display:grid;grid-template-columns:auto auto auto auto auto auto auto auto; align-self:center;">
                <div class="navregno" style="display:none;grid-auto-flow:column;grid-gap:0.25rem;align-items:center;align-self:center;justify-content:center;height:51px;margin:0 0.5rem 0;">
                  <form id="navvehiclereg" action="/report" method="post">
                  </form>
                  <div style="display:grid;justify-items:center;height:100%">
                    <input type="text" name="regno" form="navvehiclereg" placeholder="Enter Reg" class="form" pattern="^[A-Z0-9]{7}$" title="Exact 7 alphanumeric characters required in capital." required style="background-color:#f9d441;padding:0.1rem;font-size:2rem;text-align:center;outline:none;border:0;width:100%;max-width:22rem;">
                  </div>
                  <div style="display:grid;justify-items:center;height:100%;">
                    <input type="submit" form="navvehiclereg" style="background-color:#66d469;font-size:2rem;font-weight:bold;border:0;width:100%;max-width:22rem;cursor:pointer;" value="Go">
                  </div>
                </div>
                <script defer>
                  document.addEventListener('scroll', ()=> {
                    if(window.scrollY >= 180 && window.location.pathname == "/") {
                      document.querySelector(".navregno").style.display = "grid";
                    }
                    if(window.scrollY < 180  && window.location.pathname == "/") {
                      document.querySelector(".navregno").style.display = "none";
                    }
                  });
                </script>
                <div class="" style="display:grid;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/';">
                  HOME
                </div>
                <div class="homeadmin" style="display:none;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/admin';">
                  ADMIN
                </div>
                <div class="homedashboard" style="display:none;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/dashboard/reports';">
                  DASHBOARD
                </div>
                <div class="" style="display:grid;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/#services';">
                  SERVICES
                </div>
                <div class="" style="display:grid;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/#packages';">
                  PACKAGES
                </div>
                <div class="" style="display:grid;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/about';">
                  ABOUT US
                </div>
                <div class="" style="display:grid;align-self:center;justify-self:center;font-weight:bold;margin:0.5rem;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/contact';">
                  CONTACT US
                </div>
                <div class="navlogin" style="display:none;align-items:center;justify-items:center;padding:0.5rem;background-color:#f9d441;font-weight:bold;cursor:pointer;" onclick="window.location.href='/account/login';">
                  LOGIN
                </div>
                <div class="navlogout" style="display:none;align-items:center;justify-items:center;padding:0.5rem;background-color:#f9d441;font-weight:bold;cursor:pointer;" onclick="window.location.href='/account/logout';">
                  LOGOUT
                </div>
              </div>
            </div>
            <div class="navmob" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(0,auto));align-items:start;position:fixed;top:0;width:calc(100vw - 0.5rem);padding:0.5rem;background:white;overflow:hidden;z-index:1;">
              <div class="navmoblogo" style="display:grid;justify-items:start;cursor:pointer;height:51px;width:64;" onclick="window.location.href='/'">
                <img class="logo" src="/logo.jpg" style="height:51px;" alt="vistek logo" loading="lazy" onclick="window.href='/'">
              </div>
              <div class="navmobregno" style="display:none;grid-auto-flow:column;grid-gap:0.25rem;align-items:start;justify-content:center;height:51px;margin:0 0.5rem 0;">
                <form id="navmobvehiclereg" action="/report" method="post">
                </form>
                <div style="display:grid;justify-items:center;height:100%">
                  <input type="text" name="regno" form="navmobvehiclereg" placeholder="Enter Reg" class="form" pattern="^[A-Z0-9]{7}$" title="Exact 7 alphanumeric characters required in capital." required style="background-color:#f9d441;padding:0.1rem;font-size:2rem;text-align:center;outline:none;border:0;width:100%;max-width:22rem;">
                </div>
                <div style="display:grid;justify-items:center;height:100%;">
                  <input type="submit" form="navmobvehiclereg" style="background-color:#66d469;font-size:2rem;font-weight:bold;border:0;width:100%;max-width:22rem;cursor:pointer;" value="Go">
                </div>
              </div>
              <script defer>
                document.addEventListener('scroll', ()=> {
                  if(window.scrollY >= 180 && window.location.pathname == "/") {
                    document.querySelector(".navmobregno").style.display = "grid";
                  }
                  if(window.scrollY < 180  && window.location.pathname == "/") {
                    document.querySelector(".navmobregno").style.display = "none";
                  }
                });
              </script>
              <div class="navmobhamburger" style="display:grid;align-items:start;justify-items:end;height:51px;">
                <img src="/navmenu.png" style="height:51px;" loading="lazy" alt="hamburger mobile menu">
              </div>
            </div>
            <div class="navmobclick" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));align-items:center;align-content:start;grid-gap:0.5rem;position:fixed;top:0;width:100vw;height:100vh;overflow:hidden;background-color:#2f2e2a;color:white;z-index:2;">
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(0,auto));justify-content:stretch;grid-gap:0.5rem;margin:0.5rem;">
                <div style="display:grid;justify-items:start;align-items:center;">
                  <a href="/">
                    <img class="logo" src="/logodark.png" style="width:4rem;background:grey url('/logodark.png') cover;" alt="vistek logo" loading="lazy">
                  </a></div>
                <div style="display:grid;justify-items:end;align-items:center;margin-right:0.5rem;font-size:2rem;" class="cross">X</div>
              </div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/';">Home</div>
              <div class="navmobadmin" style="display:none;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/admin';">Admin</div>
              <div class="navmobdashboard" style="display:none;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/dashboard/reports';">Dashboard</div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/#services';navmobcross();">Services</div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/#packages';navmobcross();">Packages</div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/privacy'">Privacy Policy</div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/terms'">Terms & Conditions</div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/about'">About Us</div>
              <div style="display:grid;justify-items:center;padding:0.5rem;cursor:pointer;" onclick="window.location.href='/contact'">Contact Us</div>
              <div class="moblogin" style="display:none;justify-items:center;padding:0.5rem;cursor:pointer;" onClick="window.location.href='/account/login';">Login</div>
              <div class="moblogout" style="display:none;justify-items:center;padding:0.5rem;cursor:pointer;" onClick="window.location.href='/account/logout';">Logout</div>
            </div>
            <script defer>
              window.addEventListener("DOMContentLoaded",navbardesktopmobile);
              window.addEventListener("resize",navbardesktopmobile);
              function navbardesktopmobile(){
                let width = Math.min(window.innerWidth,screen.width); //window.innerWidth works on Desktop only, screen.width works on mobiles only.
                if(width<550){
                  document.querySelector(".nav").style.display = "none";
                  document.querySelector(".navmob").style.display = "grid";
                  document.querySelector(".navmobclick").style.display = "none";
                  document.querySelector(".navmobhamburger").addEventListener("click",navmobclick);
                }
                if(width>551){
                  document.querySelector(".nav").style.display = "grid";
                  document.querySelector(".navmob").style.display = "none";
                  document.querySelector(".navmobclick").style.display = "none";
                }
              }
              function navmobclick(){
                document.querySelector(".nav").style.display = "none";
                document.querySelector(".navmob").style.display = "none";
                document.querySelector(".navmobclick").style.display = "grid";
                document.querySelector(".cross").addEventListener("click",navmobcross);
              }
              function navmobcross(){
                document.querySelector(".nav").style.display = "none";
                document.querySelector(".navmob").style.display = "grid";
                document.querySelector(".navmobclick").style.display = "none";
                document.querySelector(".navmobhamburger").addEventListener("click",navmobclick);
              }
            </script>
          </div>
          <div class = "home" style="display:none;">
            <div class="homebanner" id="homebanner">
              <div class="homebannerbg" style="display:grid;justify-items:center;grid-gap:0.5rem;margin:0 0 0.5rem;">
                <div>
                </div>
                <div style="display:grid;justify-items:stretch;align-self:end;justify-content:center;font-size:2rem;margin-top:0.5rem;text-align:center;margin:0.5rem;">
                  <div id="homeregno">
                    Get An Instant Vehicle History Check Now
                  </div>
                </div>
                <div>
                </div>
                <div class="grid" style="justify-content:center;">
                    <form id="vehiclereg" action="/report" method="post">
                    </form>
                    <div style="display:grid;justify-items:center;">
                      <input type="text" name="regno" form="vehiclereg" placeholder="Enter Reg" class="homebannerbginput form" required style="background-color:#f9d441;padding:0.1rem;font-size:3rem;text-align:center;outline:none;border:0;width:100%;max-width:22rem;text-transform:uppercase;">
                    </div>
                    <div style="display:grid;justify-items:center;">
                      <button type="submit" form="vehiclereg" style="background-color:#66d469;font-size:3rem;font-weight:bold;border:0;width:100%;max-width:22rem;cursor:pointer;" onclick="let pattern = /^[a-zA-Z0-9]{7}$/; if(!pattern.test(document.querySelector('.homebannerbginput').value)) {
                      window.document.querySelector('.homebannerbgmessage').style.display = 'grid';
                      window.document.querySelector('.homebannerbgmessage').innerHTML = 'Invalid Vehicle Registration Number. Please enter exact 7 alphanumerical characters.';
                      window.document.querySelector('.homebannerbgmessage').style.color = '#ef5350';
                      window.document.querySelector('.homebannerbgmessage').style.fontWeight = 'bold';
                      return false;
                    }">
                      GO
                    </div>
                </div>
                <div class="homebannerbgmessage" style="display:none;padding:0.5rem 0.5rem 0 0.5rem;">
                </div>
              </div>
            </div>
            <div class="services1" id="services" style="display:grid;justify-items:center;">
              <div style="display:grid;justify-items:center;width:96vw;margin:0.5em;margin:1rem 0;">
                <div style="display:grid;grid-template-rows: auto auto; justify-items:center;grid-gap:0.5rem;width:100%;">
                  <div style="display:grid;justify-items:center;width:100%;">
                    <div style="display:grid;justify-items:center;grid-gap:0.5rem;background:#f9d441;font-size:2rem;font-weight:bold;padding:0.5rem;">
                      Services
                    </div>
                  </div>
                  <div style="display:grid;justify-items:center;width:calc(100%-1rem);">
                    <div style="display:grid;justify-items:center;font-size:1rem;background:#2f2e2a;">
                      <div class="homeservices1section1" style="display:grid;justify-items:center;grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;width:calc(100%-1rem);">
                        <div style="width:calc(100%-1rem);color:white;text-align:center;font-weight:bold;padding:0.5rem;">Things we check
                        </div>
                        <div style="width:calc(100%-1rem);justify-self:center;background:white;text-align:center;padding:0.5rem;">We check 50+ data points including but not limited to <br/>outstanding finance, insurance, write-off, police verification, stolen status, mileage history, owner/keeper changes.
                        </div>
                      </div>
                      <div class="homeservices1section2" style="display:grid;justify-items:center;grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;width:calc(100% - 1rem);">
                        <div style="width:calc(100%-1rem);color:white;text-align:center;font-weight:bold;padding:0.5rem;">Live vehicle statistics
                        </div>
                        <div style="width:100%;justify-self:center;background:white;text-align:center;padding:0.5rem 0;">We are confident in our data. All of our data comes from authenticated sources.
                        </div>
                      </div>
                      <div class="homeservices1section3" style="display:grid;justify-items:center;grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;width:calc(100% - 1rem);">
                        <div style="width:calc(100%-1rem);color:white;text-align:center;font-weight:bold;padding:0.5rem;">Free VIS Check
                        </div>
                        <div style="width:100%;justify-self:center;background:white;text-align:center;padding:0.5rem 0;">
                          Our Basic Report is free for all users.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="services2" style="display:grid;justify-items:center;justify-self:center;text-align:justify;border-bottom: 0.1rem solid grey;">
              <div style="display:grid;justify-items:center;width:96vw;margin:0.5rem;margin:1rem 0;">
                <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;grid-gap:0.5rem;width:calc(100%-1rem);">
                  <div style="display:grid;justify-items:center;">
                    <div style="justify-self:center;background:#f9d441;font-size:2rem;font-weight:bold;padding:0.5rem;text-align:center;">What will Vehicle Information Systems Report actually check my car for?
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));justify-items:stretch;grid-gap:0.5rem;color:white;font-size:1rem;width:100%;">
                    <div style="background:#2f2e2a;padding:0.5rem;">OutStanding Finance
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Insurance Writeoff
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">High Risk Vehicle
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Imported
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Exported
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Scrapped
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Color Changed
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">MOT Status
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">MOT Due
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">VIN/Chessis Check
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Number of Owners
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Valuations
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Logbook Check
                    </div>
                    <div style="background:#2f2e2a;padding:0.5rem;">Stolen Vehicle Check
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="details" style="display:grid;justify-items:center;justify-self:center;text-align:justify;border-bottom: 0.1rem solid grey;margin-top:1rem;" class="details">
              <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;grid-gap:2rem;margin:1rem 0;">
                <div style="font-size:2rem;font-weight:bold;justify-self:center;text-align:center;">
                  Outstanding Car Finance & Logbook Loan Check
                </div>
                <div>
                  If you buy a car that has an outstanding loan or finance agreement against it, then you are in danger of losing the vehicle, and money you paid for it. This is a real risk when purchasing a second-hand vehicle, so using a car finance checker to look into its history is an important action to take.<br/><br/>
                  Our full VIS Report includes a car finance check, which will flag up any outstanding finance agreements that remain on the vehicle. This vehicle finance check will quickly let you know if the car, van or motorbike you are after is safe to buy.
                </div>
                <div style="font-size:2rem;font-weight:bold;justify-self:center;text-align:center;">
                  Legal ownership of the Vehicle
                </div>
                <div>
                  When finance is taken out on a car, it means that the lender maintains ownership of the vehicle until the complete debt has been paid off. Only then does it become the property of the borrower. An outstanding finance check will inform you of whether there is any debt owed on the vehicle.<br/><br/>
                  Otherwise, even if you buy a car with the best intentions, without undertaking any HPI Finance Check on the car, you could endup buying a vehicle that is not legally yours. Where the finance has not been settled, the lender is within their rights to repossess the vehicle, meaning you could lose the car and money you paid.
                </div>
                <div style="font-size:2rem;font-weight:bold;justify-self:center;text-align:center;">
                  Check the Vehicle's Finance History
                </div>
                <div>
                  Our Vehicle Checker's services include many essential inspections to ensure the car you are buying is safe and legal to purchase, including a logbook loan check. The debt stays with the vehicle and not the borrower, so unless you use a Car Finance Checker beforehand, you can be taking on an extra financial burden or putting yourself at risk of losing the car.<br/><br/>
                  Bewary of any place offering a free Car Check though, as anywhere that claims to provide such a service will not be delivering the genuine article. Instead, use the reliable VIS Reports to be safe in the knowledge of your new vehicle's financial history.
                </div>
              </div>
            </div>
            <div class="homepackages packages" id="packages" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));grid-gap:15px;justify-items:center;justify-self:center;text-align:justify;margin-top:1rem;width:96vw;">
              <div class="homepackagestitle" style="display:grid;justify-items:center;margin-bottom:0.5rem;">
                <div style="justify-self:center;font-size:3rem;font-weight:bold;">
                  Packages
                </div>
              </div>
              <div class="homepackagesdetails" style="display:grid;grid-template-columns:repeat(4,minmax(0,auto));justify-items:stretch;align-items:stretch;grid-gap:0.1rem;color:white;">
                <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;background:#f9d441;padding:0.5rem;border-top-left-radius:1rem;">
                  <div style="font-size:1rem;font-weight:bold;color:black;margin-bottom:0.5rem;text-align:center;">
                    PRODUCTS
                  </div>
                  <div style="display:grid;align-self:end;font-weight:normal;font-weight:bold;color:black;text-align:center;">
                    Data
                  </div>
                </div>
                <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;background:#f9d441;padding:0.5rem;">
                  <div style="font-size:1rem;font-weight:bold;color:black;margin-bottom:0.5rem;text-align:center;">
                    BASIC REPORT
                  </div>
                  <div style="display:grid;align-self:end;font-weight:normal;font-weight:bold;color:black;text-align:center;">
                    £2.49
                  </div>
                </div>
                <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;background:#f9d441;padding:0.5rem;">
                  <div style="font-size:1rem;font-weight:bold;color:black;margin-bottom:0.5rem;text-align:center;">
                    FULL REPORT
                  </div>
                  <div style="display:grid;align-self:end;font-weight:normal;font-weight:bold;color:black;text-align:center;">
                    £7.99
                  </div>
                </div>
                <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;background:#f9d441;padding:0.5rem;border-top-right-radius:1rem;">
                  <div style="font-size:1rem;font-weight:bold;color:black;margin-bottom:0.5rem;text-align:center;">
                    MULTIPLE FULL REPORTS
                  </div>
                  <div style="display:grid;align-self:end;font-weight:normal;font-weight:bold;color:black;text-align:center;">
                    £14.45
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  DVLA Data
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Basic Information
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  All DVLA Vehicle Data
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  All DVLA Vehicle Data
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Outstanding Finance
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/cross.png" style="width:1rem;justify-self:center;background:grey url('/cross.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Stolen Check
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/cross.png" style="width:1rem;justify-self:center;background:grey url('/cross.png') cover;" alt="cross" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Insurance writeoff
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/cross.png" style="width:1rem;justify-self:center;background:grey url('/cross.png') cover;" alt="tick">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  VIS Valuation
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  VIN/Chesis Check
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Imported & Exported
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Scrapped
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  MOT History
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;">
                  <div style="display:grid;justify-self:center;align-self:center;">
                    <img style="width:16px;height:16px;" src="/tick.png" style="width:1rem;justify-self:center;background:grey url('/tick.png') cover;" alt="tick" loading="lazy">
                  </div>
                </div>
                <div style="background:#2f2e2a;padding:0.5rem;text-align:center;">
                  Number of Vehicles
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;font-weight:bold;justify-items:center;align-items:center;text-align:center;">
                  One(1)
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;font-weight:bold;justify-items:center;align-items:center;text-align:center;">
                  One(1)
                </div>
                <div style="display:grid;background:#2f2e2a;padding:0.5rem;font-weight:bold;justify-items:center;align-items:center;text-align:center;">
                  Three(3)
                </div>
                <div style="background:#2f2e2a;border-bottom-left-radius:1rem;">
                  <div style="display:grid;justify-items:center;">
                  </div>
                </div>
                <div style="background:#2f2e2a;">
                  <div style="display:grid;justify-items:center;">
                    <input name="homeregno" type="submit" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;" value="ORDER" onclick="
                      window.document.querySelector('.homebannerbgmessage').style.display = 'grid'; 
                      window.document.querySelector('.homebannerbgmessage').innerHTML = 'Please enter Vehicle Registration Number above to get its Report.'; 
                      window.document.querySelector('.homebannerbgmessage').style.color = '#B00020'; 
                      window.document.querySelector('.homebannerbgmessage').style.fontWeight = 'bold'; 
                      window.document.querySelector('.homebannerbgmessage').style.fontSize = '2rem'; 
                      window.location.href='/#homeregno';
                    ">
                  </div>
                </div>
                <div style="background:#2f2e2a;">
                  <div style="display:grid;justify-items:center;">
                    <input name="homeregno" type="submit" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;" value="ORDER" onclick="
                      window.document.querySelector('.homebannerbgmessage').style.display = 'grid'; 
                      window.document.querySelector('.homebannerbgmessage').innerHTML = 'Please enter Vehicle Registration Number above to get its Report.'; 
                      window.document.querySelector('.homebannerbgmessage').style.color = '#B00020'; 
                      window.document.querySelector('.homebannerbgmessage').style.fontWeight = 'bold'; 
                      window.document.querySelector('.homebannerbgmessage').style.fontSize = '2rem'; 
                      window.location.href='/#homeregno';"
                    ">
                  </div>
                </div>
                <div style="background:#2f2e2a;border-bottom-right-radius:1rem;">
                  <div style="display:grid;justify-items:center;">
                    <input name="homeregno" type="submit" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;" value="ORDER" onclick="
                      window.document.querySelector('.homebannerbgmessage').style.display = 'grid'; 
                      window.document.querySelector('.homebannerbgmessage').innerHTML = 'Please enter Vehicle Registration Number above to get its Report.'; 
                      window.document.querySelector('.homebannerbgmessage').style.color = '#B00020'; 
                      window.document.querySelector('.homebannerbgmessage').style.fontWeight = 'bold'; 
                      window.document.querySelector('.homebannerbgmessage').style.fontSize = '2rem'; 
                      window.location.href='/#homeregno';"
                    ">
                  </div>
                </div>
              </div>
              <div>
                <form action="/report" method="post">
                  <input type="hidden" name="regno" value="AA19AAA" required>
                  <input type="submit" value="CLICK FOR SAMPLE REPORT" style="display:grid;align-items:center;justify-items:center;background-color:#f9d441;padding:0.5rem;cursor:pointer;font-weight:bold;border:0;font-size:1rem;">
                </form>
              </div>
            </div>
            <style>
            @media screen and (min-width: 551px){
              .homepackages{
              }
            }
            @media screen and (max-width: 551px){
              .homepackages{
                font-size:0.9rem;
              }
            }
            </style>
          </div>
          <div class="account" style="display:none;justify-self:center;">
            <div class="accountmenu grid2" style="display:grid;justify-content:stretch;grid-template-columns:auto auto auto;white-space:nowrap;width:100%;margin:0.5rem 0;">
              <div class="accountmenulogin" style="display:grid;justify-items:center;align-items:center;background-color:#2f2e2a;color:white;padding:0.5rem;margin-right:0.5rem;cursor:pointer;font-weight:bold;" onclick="window.location.href='/account/login'">
                  LOGIN
              </div>
              <div class="accountmenuregister" style="display:grid;justify-items:center;align-items:center;background-color:#2f2e2a;color:white;padding:0.5rem;margin-right:0.5rem;cursor:pointer;font-weight:bold;" onclick="window.location.href='/account/register'">
                  REGISTER
              </div>
              <div class="accountmenureset" style="display:grid;justify-items:center;align-items:center;background-color:#2f2e2a;color:white;padding:0.5rem;cursor:pointer;font-weight:bold;" onclick="window.location.href='/account/reset'">
                  RESET
              </div>
            </div>
            <div class="accountlogin loginsection" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));background:#d6d6d6;justify-self:center;padding:0.5rem;width:100%;">
              <form id="accountlogin" method="post" action="/account/login">
              </form>
              <div class="accountlogintitle" style="display:grid;justify-items:center;font-size:2rem;padding:0.5rem;">
                <div id="test">
                  Login
                </div>
              </div>
              <div class="accountloginmain" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;grid-gap:1rem;">
                <div style="display:grid;justify-items:stretch;">
                  <input form="accountlogin" type="email" name="accountloginemail" placeholder="Email Address" required style="background-color:#C4C4C4;padding:1rem;border:0;outline:none;text-align:center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div style="display:grid;justify-items:stretch;">
                  <input form="accountlogin" type="password" name="accountloginpassword" placeholder="Password" required style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div style="display:grid;justify-items:stretch;width:227px;">
                  <input form="accountlogin" type="submit" placeholder="Login" value="Login" style="background-color:#f9d441;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;font-weight:bold;box-sizing:border-box;cursor:pointer;width:100%;border-radius:2rem;">
                </div>
                <div class="accountloginmessage" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));background:#d6d6d6;justify-self:center;margin:0 0.5rem;padding:0 0.5rem;font-size:0.9rem;color:red;font-weight:bold;text-align:justify;">
                  You entered wrong email or password, please re-enter the correct email/password.
                </div>  
                <div style="margin-bottom:1rem;">
                  <a href="/account/reset">
                    Did You Forgot Your password?
                  </a>    
                </div>
                <div style="display:grid;justify-self:center;border-top:2px solid #BFBDBD;width:100%;padding:0.5rem;">                
                  <div style="display:grid;justify-self:center;margin:1rem 0;">
                    Don't have an account?
                  </div>
                  <div style="display:grid;justify-self:center;justify-items:stretch;width:227px;background-color:#f9d441;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;box-sizing:border-box;cursor:pointer;border-radius:2rem;font-weight:bold;" onclick="window.location.href='/account/register'">
                    Register
                  </div>
                </div>
              </div>
            </div>
            <div class="accountregister register" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));background:#d6d6d6;justify-self:center;padding:0.5rem;width:100%;">
              <form method="post" id="accountregister" action="/account/register">
              </form>
              <div class="accountregistertitle" style="display:grid;justify-items:center;font-size:2rem;padding:0.5rem;">
                Register
              </div>
              <div class="accountregistermain" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;padding:0.5rem;grid-gap:1rem;">
                <div class="registername" style="display:grid;justify-items:stretch;">
                  <input class="registernameinput" form="accountregister" type="text" name="accountregistername" placeholder="Full Name (required)" required style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div class="registeremail" style="display:grid;justify-items:stretch;">
                  <input class="registeremailinput" form="accountregister" type="email" name="accountregisteremail" placeholder="Email Address (required)" required style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div class="registercontact" style="display:grid;justify-items:stretch;">
                  <input class="registercontactinput" form="accountregister" type="text" name="accountregistercontact" placeholder="Contact Number (optional)" style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align:center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div class="registerpassword" style="display:grid;justify-items:stretch;">
                  <input class="registerpasswordinput" form="accountregister" type="password" name="accountregisterpassword" placeholder="Password (required)" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$" title="Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character #, ?, !, @, $, %, ^, &, *, -." required style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div class="registersubmit" style="display:grid;justify-items:stretch;width:227px;">
                  <input class="registersubmitbutton" form="accountregister" type="submit" placeholder="Register" value="Register" style="background-color:#f9d441;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;width:100%;box-sizing:border-box;cursor:pointer;border-radius:2rem;font-weight:bold;">
                </div>
              </div>
              <div class="accountregistermessage" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));background:#d6d6d6;justify-self:center;margin:0.5rem;padding:0.5rem;font-size:0.9rem;color:#6200EE;font-weight:bold;text-align:justify;">
                Thank you for registering as a user of Vehicle Information System (VIS). Please check your email and click on the confirmation link to verify your email address.
              </div>
            </div>
            <div class="accountreset reset" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));background:#d6d6d6;justify-self:center;padding:0.5rem;width:100%;">
              <div class="accountresettitle" style="font-size:2rem;text-align:center;">
                <div style="word-wrap: break-word;">
                  Reset Password
                </div>
              </div>
              <div class="accountresetmain" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-items:center;padding:0.5rem;grid-gap:1rem;">
                <form method="post" id="accountreset" action="/account/reset">
                </form>
                <div class="accountresetemail" style="display:grid;justify-items:stretch;">
                  <input form="accountreset" type="email" name="accountresetemail" placeholder="Email Address" required style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align:center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div class="accountresetpassword" style="display:grid;justify-items:stretch;">
                  <input form="accountreset" type="password" name="accountresetpassword" placeholder="New Password" pattern="^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$" title="Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character #, ?, !, @, $, %, ^, &, *, -." required style="background-color:#c4c4c4;padding:1rem;border:0;outline:none;text-align: center;font-size:1rem;box-sizing:border-box;border-radius:2rem;">
                </div>
                <div class="accountresetsubmit" style="display:grid;justify-items:stretch;width:227px;">
                  <input form="accountreset" type="submit" value="Reset Password" style="background-color:#f9d441;padding:1rem;border:0;outline:none;text-align:center;font-size:1rem;width:100%;box-sizing:border-box;cursor:pointer;border-radius:2rem;font-weight:bold;">
                </div>
              </div>
              <div class="accountresetmessage" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));background:#d6d6d6;justify-self:center;margin:0.5rem;padding:0.5rem;font-size:0.9rem;color:#6200EE;font-weight:bold;text-align:justify;">
                Please check your email, and click on the email verification link, to change your password. The password will remain unchanged without email verification.
              </div>
            </div>
          </div>
          <style>
            @media all and (min-width: 551px){
              .account{
                margin-top: 4rem;
                width:50%;
              }
            }
            @media all and (max-width: 551px){
              .account{
                margin-top:4rem;
                width:96vw;
              }
            }
          </style>
          <div class="dashboard" style="display:none;">
            <div class="dashboardmenu grid2" style="display:grid;margin:0.5rem 0.5rem 0 0.5rem;">
              <div class="dashboardmenutitle" style="display:grid;grid-auto-flow:column;justify-content:start;justify-items:start;align-items:start;margin:0.5rem 0.5rem 0.5rem 0;font-weight:bold;">
                <div>
                  WELCOME
                </div>
                <div class="dashboardwelcomename" style="margin-left:0.5rem;">
                </div>
                <div>
                  ,
                </div>
              </div>
              <div class="dashboardmenutabs grid2" style="display:grid;justify-content:stretch;grid-template-columns:auto auto auto;white-space:nowrap;width:100%;">
                <div class="dashboardmenutabsreports" style="display:grid;justify-items:center;align-items:center;padding:0.5rem;margin-right:0.5rem;cursor:pointer;font-weight:bold;background-color:#2f2e2a;color:white;" onclick="window.location.href='/dashboard/reports'">
                  MY REPORTS
                </div>
                <div class="dashboardmenutabsbalance" style="display:grid;justify-items:center;align-items:center;padding:0.5rem;margin-right:0.5rem;cursor:pointer;font-weight:bold;background-color:#2f2e2a;color:white;" onclick="window.location.href='/dashboard/balance'">
                  MY BALANCE
                </div>
                <div class="dashboardmenutabsprofile" style="display:grid;justify-items:center;align-items:center;padding:0.5rem;cursor:pointer;font-weight:bold;background-color:#2f2e2a;color:white;" onclick="window.location.href='/dashboard/profile'">
                  PROFILE
                </div>
              </div>
            </div>
            <div class="dashboardreports dashboardrecord grid2" id="dashboardreports" style="display:none;grid-auto-flow:row;justify-items:center;margin:0.5rem;">
              <form id="dashboardreportsadd" action="/dashboard/reports" method="post">
              </form>
              <form id="dashboardreportssearch" action="/dashboard/reports" method="post">
              </form>
              <form id="dashboardreportsbuttons" action="/report" method="post">
              </form>
              <form id="dashboardreportsbalance" action="/dashboard/reports" method="post">
              </form>
              <div class="dashboardreportstitle" style="justify-self:stretch;background:#f9d441;color:black;padding:0.5rem;font-weight:bold;font-size:1.5rem;">
                BALANCE
              </div>
              <div class="dashboardreportbalancevalues grid2" style="display:grid;grid-auto-flow:row;grid-gap:0;justify-content:stretch;background:#2f2e2a;font-size:1rem;width:100%;">
                <div class="dashboardreportbalancesbalanceadd" style="display:grid;grid-auto-flow:column;">  
                  <div class="dashboardreportbalances" style="display:grid;grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;width:100%;">
                    <div style="display:grid;justify-content:end;padding:0 0.5rem;color:#CF9AFF;background:#3f3e3a;">
                      <div style="display:grid;align-self:end;">
                        <img src="/basicreporticon.webp" style="display:grid;align-self:end;justify-self:center;width:4rem;filter:invert(100%);" alt="car icon" loading="lazy">
                      </div>
                      <div class="dashboardreportbalancebasic" style="display:grid;align-self:end;justify-self:center;font-size:4rem;">
                          0
                      </div>
                      <div style="display:grid;align-self:end;justify-content:center;">
                        BASIC REPORT CREDITS
                      </div>
                      <div class="dashboardreportbalanceaddbasic">
                        <input class="dashboardreportbalanceaddbasicinput" name="dashboardreportsbalanceaddbasic" type="submit" form="dashboardreportsbalance" value="ORDER BASIC REPORT" style="background:#f9d441;border:0;margin:0.5rem;padding:0.5rem;font-weight:bold;cursor:pointer;width:100%;">
                      </div>
                      <div style="width:255.16px;height:47px;">
                      </div>
                    </div>
                    <div style="display:grid;justify-content:end;padding:0 0.5rem;color:#CF9AFF;background:#3f3e3a;">
                      <div style="display:grid;align-self:end;">
                        <img src="/fullreporticon.png" style="display:grid;align-self:end;justify-self:center;width:4rem;filter:invert(100%);" alt="car icon" loading="lazy">
                      </div>
                      <div class="dashboardreportbalancefull" style="display:grid;align-self:end;justify-self:center;font-size:4rem;">
                          0
                      </div> 
                      <div style="display:grid;align-self:end;justify-content:center;">
                        FULL REPORT CREDITS
                      </div>
                      <div class="dashboardreportbalanceaddfull">
                        <input class="dashboardreportbalanceaddfullinput" name="dashboardreportsbalanceaddfull" type="submit" form="dashboardreportsbalance" value="ORDER FULL REPORT" style="background:#f9d441;border:0;margin:0.5rem;padding:0.5rem;font-weight:bold;cursor:pointer;width:100%;">
                      </div>
                      <div class="dashboardbalanceaddmulti">
                        <input class="dashboardreportbalanceaddmultiinput" name="dashboardreportsbalanceaddmulti" type="submit" form="dashboardreportsbalance" value="ORDER MULTIPLE FULL REPORTS" style="background:#f9d441;border:0;margin:0.5rem;padding:0.5rem;font-weight:bold;cursor:pointer;width:100%;">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dashboardreportsbalancemessage" style="display:none;padding:0.5rem;color:#CF9AFF;font-size:1.25rem;">
                </div>
              </div>
              <div class="dashboardreportsrecordstitle" style="justify-self:stretch;background:#f9d441;color:black;padding:0.5rem;margin-top:1rem;font-weight:bold;font-size:1.5rem;">
                REPORTS
              </div>
              <div style="width:100%;">
                <div class="dashboardaddsearch" style="display:grid;width:100%;align-content:start;">
                  <div class="dashboardadd" style="display:grid;background:#2f2e2a;padding:0.5rem 0 0 0;width:100%;">
                    <div style="display:grid;grid-auto-flow:column;justify-content:start;">
                      <div style="display:grid;justify-items:start;margin:0 0.5rem;">
                        <input type="text" name="dashboardreportsregno" form="dashboardreportsadd" placeholder="Enter Reg" class="dashboardaddinput form" style="border:0;padding:0.5rem;width:100%;text-transform:uppercase;">
                      </div>
                      <div style="display:grid;justify-items:center;margin:0 0.5rem;">
                        <button type="submit" form="dashboardreportsadd" name="dashboardreportsaddcar" style="background-color:#f9d441;border:0;cursor:pointer;padding:0.5rem;font-weight:bold;width:120px;" value="1" onclick="let pattern = /^[a-zA-Z0-9]{7}$/; if(!pattern.test(document.querySelector('.dashboardaddinput').value)) {
                          window.document.querySelector('.dashboardaddmessage').style.display = 'grid';
                          window.document.querySelector('.dashboardaddmessage').innerHTML = 'Invalid Vehicle Registration Number. Please enter exact 7 alphanumerical characters.';
                          window.document.querySelector('.dashboardaddmessage').style.color = '#CF6679';
                          return false;
                        }">ADD</button>
                      </div>
                    </div>
                    <div class="dashboardaddmessage" style="display:none;color:red;padding:0.5rem 0.5rem 0 0.5rem;">
                    </div>
                  </div>
                  <div class="dashboardsearch" style="display:grid;background:#2f2e2a;padding:0.5rem 0 0.5rem 0;width:100%;">
                    <div style="display:grid;grid-auto-flow:column;justify-content:start;">
                      <div style="display:grid;justify-items:start;margin:0 0.5rem;">
                        <input type="text" name="dashboardreportssearch" form="dashboardreportssearch" placeholder="Enter Reg" class="dashboardsearchinput form" style="border:0;padding:0.5rem;width:100%;text-transform:uppercase;" >
                      </div>
                      <div style="display:grid;justify-items:center;margin:0 0.5rem;">
                        <button type="submit" form="dashboardreportssearch" style="background-color:#f9d441;border:0;cursor:pointer;padding:0.5rem;font-weight:bold;width:120px;" value="1" onclick="let pattern = /^[a-zA-Z0-9]{7}$/; if(!pattern.test(document.querySelector('.dashboardsearchinput').value)) {
                          window.document.querySelector('.dashboardsearchmessage').style.display = 'grid';
                          window.document.querySelector('.dashboardsearchmessage').innerHTML = 'Invalid Vehicle Registration Number. Please enter exact 7 alphanumerical characters.';
                          window.document.querySelector('.dashboardsearchmessage').style.color = '#CF6679';
                          return false;
                        }">SEARCH</button>
                      </div>
                    </div>
                    <div class="dashboardsearchmessage" style="display:none;color:red;padding:0.5rem 0.5rem 0 0.5rem;">
                    </div>
                  </div>
                </div>
                <div style="padding:0.5rem;color:#CF9AFF;background:#2f2e2a;border-bottom:0.1rem solid gray;width:100%;font-size:1.1rem;">
                  Note: Disabled View Report Buttons means you need to add respective Credits. To add Credits, <a href="/dashboard/balance">click here</a>.
                </div>
              </div>
              <div class="dashboardreportsrecordtemplate" style="display:none;">
                <div class="grid" style="display:grid;grid-gap:0;justify-content:space-between;background:#2f2e2a;font-size:1rem;width:100%;border-bottom:0.1rem solid gray;">
                  <div style="display:grid;grid-template-columns:auto auto;justify-items:center;align-items:center;justify-content:start;align-content:center;grid-gap:0.5rem;color:white;padding:0.5rem;">
                    <div>
                      REG NO. 
                    </div>
                    <div class="dashboardregno" style="display:inline;font-size:2rem;">
                      AA19AAA
                    </div>
                  </div>
                  <div style="display:grid;grid-auto-flow:column;grid-gap:0;width:100%;">
                    <button class="dashboardreportfree" name="regno" type="submit" form="dashboardreportsbuttons" style="display:grid;justify-items:center;align-items:center;padding:0.5rem;margin:0.5rem;font-weight:bold;min-width:200;background-color:#f9d441;cursor:pointer;border:0;">VIEW FREE REPORT
                    </button>
                    <button class="dashboardreportbasic" name="regno" type="submit" form="dashboardreportsbuttons" style="display:grid;justify-items:center;align-items:center;padding:0.5rem;margin:0.5rem;font-weight:bold;min-width:200;background-color:#f9d441;cursor:pointer;border:0;">VIEW BASIC REPORT
                    </button>
                    <button class="dashboardreportfull" name="regno" type="submit" form="dashboardreportsbuttons" style="display:grid;justify-items:center;align-items:center;padding:0.5rem;margin:0.5rem;font-weight:bold;min-width:200;background-color:#f9d441;cursor:pointer;border:0;">VIEW FULL REPORT
                    </button>
                  </div>
                </div>
              </div>
              <div class="dashboardreportsrecords" style="display:grid;grid-auto-flow:row;grid-gap:0;justify-content:stretch;background:#2f2e2a;font-size:1rem;width:100%;">
                <div style="display:grid;justify-self:center;padding:0.5rem;margin:0.5rem;color:white;font-weight:bold;">
                  NO RECORDS TO DISPLAY. CLICK ADD ABOVE TO INSERT A VEHICLE.
                </div>
              </div>
              <script>
                function dashboardreportsrecordsloadmore() {
                  window["dashboardreportsrecords"] = window["dashboardreportsrecords"] + 10;
                  let count = 0;
                  let length = Array.from(document.querySelector(".dashboardreportsrecords").children).length;
                  Array.from(document.querySelector(".dashboardreportsrecords").children).forEach(val => {
                    if (count < window["dashboardreportsrecords"]) {
                      val.style.display = "grid";
                      count++;
                    }
                    if (window["dashboardreportsrecords"] >= length) document.querySelector(".dashboardreportsrecordsloadmore").style.display = "none";
                  });
                }
                window.addEventListener("load",()=>{
                  window["dashboardreportsrecords"] = 0;
                  dashboardreportsrecordsloadmore();
                });
              </script>
              <div class="dashboardreportsrecordsloadmore" style="display:grid;justify-content:center;background:#f9d441;color:black;width:100%;margin-top:0.5rem;font-weight:bold;padding:0.5rem;cursor:pointer;" onclick="dashboardreportsrecordsloadmore()">
                LOAD MORE
              </div>
            </div>
            <div class="dashboardbalance dashboardrecord grid2" style="display:none;grid-auto-flow:row;justify-items:center;margin:0.5rem;">
              <div style="justify-self:stretch;background:#f9d441;color:black;padding:0.5rem;font-weight:bold;font-size:1.5rem;">
                BALANCE
              </div>
              <div class="dashboardbalancevalues grid2" style="display:grid;grid-auto-flow:row;grid-gap:0;justify-content:stretch;background:#2f2e2a;font-size:1rem;width:100%;">
                <form id="dashboardbalance" action="/dashboard/balance" method="post">
                </form>
                <div class="dashboardbalancesbalanceadd" style="display:grid;grid-auto-flow:column;">  
                  <div class="dashboardbalances" style="display:grid;grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;width:100%;">
                    <div style="display:grid;justify-content:end;padding:0 0.5rem;color:#CF9AFF;background:#3f3e3a;">
                      <div style="display:grid;align-self:end;">
                        <img src="/basicreporticon.webp" style="display:grid;align-self:end;justify-self:center;width:4rem;filter:invert(100%);" alt="car icon" loading="lazy">
                      </div>
                      <div class="dashboardbalancebasic" style="display:grid;align-self:end;justify-self:center;font-size:4rem;">
                          0
                      </div>
                      <div style="display:grid;align-self:end;justify-content:center;">
                        BASIC REPORT CREDITS
                      </div>
                      <div class="dashboardbalanceaddbasic">
                        <input class="dashboardbalanceaddbasicinput" name="dashboardbalanceaddbasic" type="submit" form="dashboardbalance" value="ORDER BASIC REPORT" style="background:#f9d441;border:0;margin:0.5rem;padding:0.5rem;font-weight:bold;cursor:pointer;width:100%;">
                      </div>
                      <div style="width:255.16px;height:47px;">
                      </div>
                    </div>
                    <div style="display:grid;justify-content:end;padding:0 0.5rem;color:#CF9AFF;background:#3f3e3a;">
                      <div style="display:grid;align-self:end;">
                        <img src="/fullreporticon.png" style="display:grid;align-self:end;justify-self:center;width:4rem;filter:invert(100%);" alt="car icon" loading="lazy">
                      </div>
                      <div class="dashboardbalancefull" style="display:grid;align-self:end;justify-self:center;font-size:4rem;">
                          0
                      </div> 
                      <div style="display:grid;align-self:end;justify-content:center;">
                        FULL REPORT CREDITS
                      </div>
                      <div class="dashboardbalanceaddfull">
                        <input class="dashboardbalanceaddfullinput" name="dashboardbalanceaddfull" type="submit" form="dashboardbalance" value="ORDER FULL REPORT" style="background:#f9d441;border:0;margin:0.5rem;padding:0.5rem;font-weight:bold;cursor:pointer;width:100%;">
                      </div>
                      <div class="dashboardbalanceaddmulti">
                        <input class="dashboardbalanceaddmultiinput" name="dashboardbalanceaddmulti" type="submit" form="dashboardbalance" value="ORDER MULTIPLE FULL REPORTS" style="background:#f9d441;border:0;margin:0.5rem;padding:0.5rem;font-weight:bold;cursor:pointer;width:100%;">
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dashboardbalancemessage" style="display:none;padding:0.5rem;color:#CF9AFF;font-size:1.25rem;">
                </div>
              </div>
              <div class="dashboardbalancetransactions" style="width:100%;">
                <div class="dashboardbalancetransactionstitle" style="justify-self:stretch;background:#f9d441;color:black;padding:0.5rem;font-weight:bold;font-size:1.5rem;margin-top:0.5rem;">
                  TRANSACTION HISTORY
                </div>
                <div class="dashboardbalancetransactionsdetailstemplatetitle" style="display:none;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr 1fr;background:#2f2e2a;width:100%;color:white;">
                  <div class="dashboardbalancetransactionsdetailstemplatetitletime" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    TIME
                  </div>
                  <div class="dashboardbalancetransactionsdetailstemplatetitlepackage" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    PACKAGE
                  </div>
                  <div class="dashboardbalancetransactionsdetailstemplatetitlevehicle" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    VEHICLE
                  </div>
                  <div class="dashboardbalancetransactionsdetailstemplatetitlecharges" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    CHARGES
                  </div>
                  <div class="dashboardbalancetransactionsdetailstemplatetitlecredits" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    CREDITS
                  </div>
                  <div class="dashboardbalancetransactionsdetailstemplatetitlebalancebasic" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    BALANCE (BASIC)
                  </div>
                  <div class="dashboardbalancetransactionsdetailstemplatetitlebalancefull" style="display:grid;align-self:center;text-align:center;font-weight:bold;padding:0.5rem;">
                    BALANCE (FULL)
                  </div>
                </div>
                <div class="dashboardbalancetransactionsdetails" style="display:grid;grid-auto-flow:row;grid-gap:0;background:#2f2e2a;width:100%;color:white;">
                  <div style="padding:0.5rem;">
                    THERE ARE NO RECORDS TO DISPLAY 
                  </div>
                </div>
                <div class="dashboardbalancetransactionsdetailstemplate" style="display:none;grid-auto-flow:row;grid-gap:0;background:#2f2e2a;width:100%;color:white;border-top: 2px solid white;">                  
                  <div class="dashboardbalancetransactionsdetailstemplatefields" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr 1fr 1fr;">
                    <div class="dashboardbalancetransactionsdetailstemplatefieldstime" style="display:grid;align-self:center;text-align:center;padding:0.5rem;">
                    </div>
                    <div class="dashboardbalancetransactionsdetailstemplatefieldspackage" style="display:grid;align-self:center;text-align:center;padding:0.5rem;">
                    </div>
                    <div class="dashboardbalancetransactionsdetailstemplatefieldsvehicle" style="display:grid;align-self:center;text-align:center;">
                      <input class="dashboardbalancetransactionsdetailstemplatefieldsvehicleinput" name="regno" type="submit" form="dashboardbalanceform" value="-" style="background:rgb(47, 46, 42);border:0;color:white;font-weight:bold;cursor:pointer;width:100%;">
                    </div>
                    <div class="dashboardbalancetransactionsdetailstemplatefieldscharges" style="display:grid;align-self:center;text-align:center;padding:0.5rem;">
                    </div>
                    <div class="dashboardbalancetransactionsdetailstemplatefieldscredits" style="display:grid;align-self:center;text-align:center;padding:0.5rem;">
                    </div>
                    <div class="dashboardbalancetransactionsdetailstemplatefieldsbalancebasic" style="display:grid;align-self:center;text-align:center;padding:0.5rem;">
                    </div>
                    <div class="dashboardbalancetransactionsdetailstemplatefieldsbalancefull" style="display:grid;align-self:center;text-align:center;padding:0.5rem;">
                    </div>
                  </div>
                </div>
                <script>
                  function dashboardbalanceloadmore() {
                    window["display"] = window["display"] + 10;
                    let count = 0;
                    let length = Array.from(document.querySelector(".dashboardbalancetransactionsdetails").children).length;
                    Array.from(document.querySelector(".dashboardbalancetransactionsdetails").children).forEach(val => {
                      if (count < window["display"]) {
                        val.style.display = "grid";
                        count++;
                      }
                      if (window["display"] >= length) document.querySelector(".dashboardbalancetransactionsloadmore").style.display = "none";
                    });
                  }
                  window.addEventListener("load",()=>{
                    window["display"] = 0;
                    dashboardbalanceloadmore();
                  });
                </script>
                <div class="dashboardbalancetransactionsloadmore" style="display:grid;justify-content:center;background:#f9d441;color:black;width:100%;margin-top:0.5rem;font-weight:bold;padding:0.5rem;cursor:pointer;" onclick="dashboardbalanceloadmore()">
                  LOAD MORE
                </div>
              </div>
              <div id="dashboardpackages" class="dashboardpackages" style="display:grid;justify-self:center;">
              </div>
              <script defer>
                window.document.querySelector(".dashboardpackages").appendChild(window.document.querySelector(".packages").cloneNode(true)); //// true: clone this node and also its decendents. false: clone this node but not its descendents.
              </script>
            </div>
            <div class="dashboardprofile dashboardrecord grid2" style="display:none;grid-auto-flow:row;justify-items:stretch;margin:0.5rem;">
              <form id="dashboardprofile" action="/dashboard/profile" method="post">
              </form>
              <div style="justify-self:stretch;background:#f9d441;color:black;padding:0.5rem;font-weight:bold;font-size:1.5rem;">
                PROFILE
              </div>
              <div class="grid2" style="display:grid;grid-gap:0;grid-auto-flow:row;justify-content:stretch;background:#2f2e2a;font-size:1rem;width:100%;">
                <div style="display:grid;grid-auto-flow:column;justify-content:start;align-items:end;padding:0.5rem;">
                  <div style="display:grid;align-self:center;width:9rem;color:white;">
                    Name: 
                  </div>
                  <div>
                    <input class="dashboardprofilenamenew" form="dashboardprofile" type="text" name="dashboardprofilenamenew" placeholder="Name" required disabled="disabled" style="width:100%;padding:0.5rem;">
                  </div>
                </div>
                <div style="display:grid;grid-auto-flow:column;justify-content:start;align-items:end;padding:0 0.5rem 0.5rem 0.5rem;">
                  <div style="display:grid;align-self:center;width:9rem;color:white;">
                    Email: 
                  </div>
                  <div>
                    <input class="dashboardemailcurrent" form="dashboardprofile" type="hidden" name="dashboardemailcurrent" placeholder="Email" required disabled="disabled" style="width:100%;padding:0.5rem;">
                    <input class="dashboardprofileemailnew" form="dashboardprofile" type="email" name="dashboardprofileemailnew" placeholder="Email" required disabled="disabled" style="width:100%;padding:0.5rem;">
                  </div>
                </div>
                <div style="display:grid;grid-auto-flow:column;justify-content:start;align-items:end;padding:0 0.5rem 0.5rem 0.5rem;">
                  <div style="display:grid;align-self:center;width:9rem;color:white;">
                    Contact: 
                  </div>
                  <div>
                    <input class="dashboardprofilecontactnew" form="dashboardprofile" type="text" name="dashboardprofilecontactnew" placeholder="Contact Number" style="width:100%;padding:0.5rem;">
                  </div>
                </div>
                <div style="display:grid;grid-auto-flow:column;justify-content:start;align-items:end;padding:0 0.5rem 0.5rem 0.5rem;">
                  <div style="display:grid;grid-auto-flow:column;align-self:center;width:9rem;color:white;">
                    <div>
                      Current Password
                    </div>
                    <div style="color:#CF6679;">
                      *
                    </div>
                    <div>
                      :
                    </div>
                     
                  </div>
                  <div>
                    <input class="dashboardpasswordcurrent" form="dashboardprofile" type="password" name="dashboardpasswordcurrent" placeholder="Current Password" required style="width:100%;padding:0.5rem;">
                  </div>
                </div>
                <div style="display:grid;grid-auto-flow:column;justify-content:start;align-items:end;padding:0 0.5rem 0.5rem 0.5rem;">
                  <div style="display:grid;align-self:center;width:9rem;color:white;">
                    New Password: 
                  </div>
                  <div>
                    <input class="dashboardprofilepasswordnew" form="dashboardprofile" type="password" name="dashboardprofilepasswordnew" placeholder="New Password" style="width:100%;padding:0.5rem;">
                  </div>
                </div>
                <div style="display:grid;justify-content:stretch;padding:0 0.5rem 0.5rem 0.5rem;">
                  <input type="submit" name="dashboardprofilesubmit" form="dashboardprofile" value="EDIT AND SUBMIT CHANGES" style="display:grid;justify-items:center;align-items:center;background-color:#f9d441;padding:0.5rem;cursor:pointer;font-weight:bold;border:0;max-width:333px;">
                </div>
                <div class="dashboardprofilemessage" style="display:none;grid-auto-flow:column;justify-content:start;align-items:end;padding:0 0.5rem 0.5rem 0.5rem;color:#6200EE;">
                  Account Profile settings changed successfully.
                </div>
                <div class="dashboardprofilenote" style="display:grid;grid-auto-flow:column;justify-content:start;align-items:end;padding:0 0.5rem 0.5rem 0.5rem;color:#BB86FC;">
                  Note: Name and Email can not be changed. Contact Number change is optional. Current Password is required. Leave New password field blank, if password change is not desired.
                </div>
              </div>
            </div>
            <form id="dashboardbalanceform" method="post" action="/report">
            </form>
            <style>
              @media all and (min-width: 551px){
              }
              @media all and (max-width: 551px){
                .dashboardbalancetransactionsdetailstemplatetitle{
                  font-size:0.6rem;
                }
                .dashboardbalancetransactionsdetails{
                  font-size:0.6rem;
                }
                .dashboardbalancetransactionsdetailstemplatefieldstime{
                  font-size:0.5rem;
                }
                .dashboardbalancetransactionsdetailstemplatefieldsvehicleinput{
                  font-size:0.6rem;
                }
              }
            </style>
          </div>
          <div class="admin" style="display:none;">
            <div class="admintitle" style="background-image:url('aboutbackground.jpg');background-size:cover;text-align:center;font-weight:bold;font-size:4rem;width:100%;">
              <div class="abouttitletext">
                Admin Panel
              </div>
            </div>
            <div class="admincaption" style="display:grid;justify-self:center;background-color:#f9d441;padding:0.5rem;margin:0.5rem;width:calc(100% - 2rem);border-radius:0.5rem;text-align:center;font-weight:bold;font-size:2rem;">
              Database Operations
            </div>
            <div class="adminnotes" style="padding:0.5rem;">
              To create/read/update/delete data, select the data type, enter the ID, and then press Submit, e.g. users/email, vehicles/registrationnumber, or webhook/websitename. Create New data, Update existing data, or the Delete data, then press Submit again to save it.
            </div>
            <div class="adminform" style="display:grid;justify-self:center;grid-gap:0.5rem;padding:0.5rem;margin:0.5rem;width:calc(100% - 2rem);border-radius:0.5rem;">
              <div class="adminforminput" style="display:grid;grid-gap:0.5rem;justify-content:start;align-items:center;">  
                <div style="font-size:2rem;">
                  Data Path:
                </div>
                <div style="display:grid;align-self:center;font-size:2rem;">
                  <select class="adminforminputroot" name="root" form="adminform" style="background:#f9d441;border:0;font-size:2rem;">
                    <option value="users">Users</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="webhooks">Webhooks</option>
                  </select>
                </div>
                <div style="display:grid;align-self:center;font-size:2rem;">
                  /
                </div>
                <div style="display:grid;align-self:center;font-size:2rem;">
                  <input class="adminforminputid" name="id" type="text" form="adminform" placeholder="Enter ID" style="background:#f9d441;border:0;font-size:2rem;">
                </div>
              </div>
              <input class="adminjsonhidden" type="hidden" form="adminform" name="json" value="">
              <div class="adminjson" style="border:thin solid #f9d441;padding:0.5rem;">
                Please select the Data Path above to View/Update/Delete it ...
              </div>
              <div class="adminmessage" style="color:#17a2b8;">
              </div>
              <div>
                <input type="submit" form="adminform" value="Submit" style="border:0;padding:0.5rem;background:#66d469;font-weight:bold;width:100%;font-size:2rem;cursor:pointer;">
              </div>
            </div>
            <form id="adminform" method="post" action="/admin" onsubmit="return adminform()">
            </form>
            <style>
              .jsoneditor{
                border: thin solid #f9d441;
              }
              .jsoneditor-menu{
                background-color: #f9d441;
                border-bottom: 1px solid #f9d441;
              }
              @media all and (min-width: 551px){
                .admin{
                  margin-top:4.5rem;
                }
                .admintitle{
                  padding:20rem 0;
                }
                .adminforminput{
                  grid-auto-flow:column;
                }
              }
              @media all and (max-width: 551px){
                .admin{
                  margin-top:4.5rem;
                }
                .admintitle{
                  padding:5rem 0;
                }
                .adminforminput{
                  grid-auto-flow:row;
                }
              }
            </style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.7.0/jsoneditor.min.css" />
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.7.0/jsoneditor.min.js" defer>
            </script>
            <script defer>
              function adminform(){
                document.querySelector(".adminjsonhidden").setAttribute("value", JSON.stringify(window["adminjson"].get()));
                return true;
              }

              window.addEventListener("load",()=>{
                if (dom.admin.json && Object.values(dom.admin.json).length) {
                  document.querySelector(".adminjson").innerHTML = "";
                  document.querySelector(".adminjson").style = "";
                  document.querySelector(".adminforminputroot").value = dom.admin.root;
                  document.querySelector(".adminforminputid").value = dom.admin.id;
                  window["adminjson"] = new JSONEditor(document.querySelector(".adminjson"), {
                    mode: "form",
                    name: dom.admin.id,
                    sortObjectKeys: true,
                    history: false
                  });
                  window["adminjson"].set(dom.admin.json);
                  window.document.querySelector(".adminmessage").innerHTML = dom.admin.message;
                }
              });
            </script>
          </div>
          <div class="report" style="display:none;align-items:start;justify-items:center;justify-self:center;grid-gap:0.5rem;width:96%;">
            <div class="reportlogo" style="display:none;grid-auto-flow:column;justify-self:start;justify-items:start;margin-bottom:1rem;">
              <div>
                <img src="/logo.jpg" style="width:4rem;background-color:grey;background-image:url('/logo.jpg');background-size:cover;" alt="vistek logo" loading="lazy">
              </div>
              <div style="display:grid;align-self:center;justify-self:center;font-size:2rem;text-align:center;margin-left:1rem;">
                VISTEK - Vehicle Information Systems
              </div>
            </div>
            <div class="reportmenu" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-self:center;width:100%;">
              <div style="display:grid;justify-items:center;background:#f9d441;padding:0.5rem;">
                <div style="display:grid;justify-items:center;">
                  <div style="font-size:1.5rem;">
                    YOUR VIS REPORT FOR 
                  </div>
                  <div class="reportregno" style="font-weight:bold;font-size:1.5rem;">
                    NOT AVAILABLE
                  </div>
                </div>
              </div>
              <div style="display:grid;grid-template-rows:repeat(10, auto);background:#2f2e2a;color:white;grid-gap:0.5rem;padding:0.5rem;">
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportdvlaataglance'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    AT A GLANCE
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportbasicregistrationdata'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    REGISTRATION DATA
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportbasicvaluationdata'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    VALUATION DATA
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportbasicmothistorylist'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    MOT HISTORY LIST
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportfullchecksummary'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    FULLCHECK SUMMARY
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportfullplatetransferlist'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    PLATE TRANSFER LIST
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportfullkeeperchangelist'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    KEEPER CHANGE LIST
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportfullfinancerecordlist'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    FINANCE RECORD LIST
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 10fr;cursor:pointer;" onclick="window.location.href='/report#reportfullmileagerecordlist'">
                  <div style="margin:0.3rem 0.5rem 0.1rem;width:10px;height:10px;background-color:#f9d441;border-radius:50%;">
                  </div>
                  <div style="display:grid;justify-self:start;font-size:1rem;">
                    MILEAGE RECORD LIST
                  </div>
                </div>
              </div>
              <div class="reportprinthide" style="display:grid;margin:0.5rem;border-radius:0.5rem;">
                <div style="display:grid;justify-items:center;align-items:center;background-color:#f9d441;padding:0.5rem;cursor:pointer;font-weight:bold;text-align:center;font-size:1rem;" onclick="window.print()">
                  PRINT / DOWNLOAD REPORT AS PDF
                </div>
              </div>
            </div>
            <div class="reportpagebreak" style="display:none;">
              &nbsp;
            </div>
            <div class="reportmain" style="display:grid;grid-template-rows:repeat(11, auto);grid-gap:0.5rem;">
              <div class="reportfree dvlasection">
                <div style="display:grid;grid-template-rows:auto auto auto;justify-self:center;width:100%;">
                  <div id="reportdvlaataglance" style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                    AT A GLANCE
                  </div>
                  <div class="dvla" style="display:grid;grid-template-columns:1fr 1fr;background:#2f2e2a;color:white;padding:0.5rem;border-bottom: 2px solid white;">
                    <div class="reportregno" style="align-self:end;font-size:2rem;font-weight:bold;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;grid-template-rows:auto auto;align-items:end;">
                      <div class="reportid" style="align-self:end;">
                        REPORT ID: NOT AVAILABLE
                      </div>
                      <div class="date">
                        REPORT DATE: NOT AVAILABLE
                      </div>
                    </div>
                  </div>
                  <div class="reportmainfreedvladata dvla" style="display:grid;grid-template-columns: auto auto auto;background:#2f2e2a;padding:0.5rem;">
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">MAKE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">YEAR
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">FIRST REGISTERED
                    </div>
                    <div class="make" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="year" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="firstreg" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">COLOR
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">ENGINE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">FUEL
                    </div>
                    <div class="color" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="enginetype" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="fueltype" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">WHEEL PLAN
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">CO2 EMISSIONS
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">EURO STATUS
                    </div>
                    <div class="wheelplan" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="co2emissions" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="eurostatus" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">MARKED FOR EXPORT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">REVENUE WEIGHT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">TYPE APPROVAL
                    </div>
                    <div class="export" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="revenueweight" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="typeapproval" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">MOT STATUS
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">TAX DUE DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">TAX STATUS
                    </div>
                    <div class="motstatus" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="taxdue" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div class="taxstatus" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">DATE OF LAST V5C ISSUED
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div class="v5c" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">NOT AVAILABLE
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                  </div>
                </div>
              </div>
              <div class="reportpagebreak" style="display:none;">
                &nbsp;
              </div>  
              <div class="reportbasic basicsection" style="display:grid;grid-gap:0.5rem;">
                <div class="reportbasicregistration basicregistration" style="display:grid;grid-template-rows:auto auto;justify-self:center;width:100%;background:#2f2e2a;">
                  <div class="basicregistrationtitle" id="reportbasicregistrationdata" style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                    REGISTRATION DATA
                  </div>
                  <div class="reportmainbasicvdiregistrationdata reportbasicregistrationdata" style="display:grid;grid-template-columns: auto auto auto;background:#2f2e2a;padding:0.5rem;">
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VRM
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE FIRST REGISTERED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE FIRST REGISTERED UK
                    </div>
                    <div class="basicregistrationvrm" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationfirstregistered" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationfirstregistereduk" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE OF LAST UPDATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VEHICLE USED BEFORE REGISTRATION
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      YEAR MONTH FIRST REGISTERED
                    </div>
                    <div class="basicregistrationdatelastupdate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationvehicleusedbeforeregistration" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationvehicleyearmonthfirstregistered" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="reportbasicregistrationdatamanufacture" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem 0;font-size:0.9rem;text-align:center;">
                      YEAR OF MANUFACTURE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MAKE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MAKE MODEL
                    </div>
                    <div class="basicregistrationyearofmanufacture" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationmake" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationmakemodel" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MODEL
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MVRIS MAKE CODE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MVRIS MODEL CODE
                    </div>
                    <div class="basicregistrationmodel" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationmvrismakecode" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationmvrismodelcode" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VEHICLE CLASS
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      CO2 EMISSIONS
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      COLOR
                    </div>
                    <div class="basicregistrationvehicleclass" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationco2emissions" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationcolor" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DOOR PLAN
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DOOR PLAN LITERAL
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      ENGINE CAPACITY
                    </div>
                    <div class="basicregistrationdoorplan" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationdoorplanliteral" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationenginecapacity" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      ENGINE NUMBER
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      FUEL TYPE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MAX PERMISSIBLE MASS (KG)
                    </div>
                    <div class="reportbasicregistrationdataenginenumber basicregistrationenginenumber" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationfueltype" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationmaxpermissiblemass" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      GEAR COUNT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      GROSS WEIGHT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      SEATING CAPACITY
                    </div>
                    <div class="basicregistrationgearcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationgrossweight" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationseatingcapacity" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      TRANSMISSION
                    </div>
                    <div class="reportbasicregistrationdatatransmissioncode" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      TRANSMISSION CODE
                    </div>
                    <div class="reportbasicregistrationdatatransmissiontype" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      TRANSMISSION TYPE
                    </div>
                    <div class="reportbasicregistrationdatatransmission basicregistrationtransmission" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationtransmissioncode" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationtransmissiontype" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      WHEEL PLAN
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      IMPORTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      IMPORT NON-EU
                    </div>
                    <div class="basicregistrationwheelplan" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationimported" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationimportnoneu" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      EXPORTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE EXPORTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      SCRAPPED
                    </div>
                    <div class="basicregistrationexported" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationdateexported" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationscrapped" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE SCRAPPED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      CERTIFICATE OF DESTRUCTION ISSUED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PREVIOUS VRM GB
                    </div>
                    <div class="basicregistrationdatescrapped" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationcertificateofdestructionissued" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationpreviousvrmgb" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PREVIOUS VRM NI
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIN
                    </div>
                    <div class="reportbasicregistrationdatavinconfirmationflag" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIN CONFIRMATION FLAG
                    </div>
                    <div class="basicregistrationpreviousvrmni" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationvin" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="basicregistrationvinconfirmationflag" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIN LAST 5
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                    </div>
                    <div class="basicregistrationvinlast5" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                    </div>
                  </div>
                </div>
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>    
                <div class="reportmainbasicvdivaluation reportbasicvaluation basicvaluation" id="reportbasicvaluationdata" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(auto,auto));justify-self:center;width:100%;">
                  <div class="basicvaluationtitle" style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                    VALUATION DATA
                  </div>
                  <div class="reportmainbasicvdivaluationdata reportbasicvaluationdata" style="display:grid;grid-template-columns: auto auto auto;background:#2f2e2a;padding:0.5rem 0.5rem 0rem 0.5rem;">
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VRM
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MILEAGE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PLATE YEAR
                    </div>
                    <div class="vrm" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="mileage" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="plateyear" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VALUATION TIME
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VEHICLE DESCRIPTION
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VALUATION BOOK
                    </div>
                    <div class="reportbasicvaluationdatatime valuationtime" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="vehicledescription" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="reportbasicvaluationdatabook valuationbook" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      EXTRACT NUMBER
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                    </div>
                    <div class="extractnumber" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="co2emissions" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                    </div>
                    <div class="eurostatus" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;">
                    <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                      DESCRIPTION
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                      VALUATION (GBP)
                    </div>
                  </div>
                  <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0.1rem,auto));grid-gap:0.5rem;justify-items:stretch;background:#2f2e2a;padding:0 0.5rem 0.5rem 0.5rem;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        OTR
                      </div>
                      <div class="otr" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        DEALER FORECOURT
                      </div>
                      <div class="dealerforecourt" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        TRADE RETAIL
                      </div>
                      <div class="traderetail" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        PRIVATE CLEAN
                      </div>
                      <div class="privateclean" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        PART EXCHANGE
                      </div>
                      <div class="partexchange" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        PRIVATE AVERAGE
                      </div>
                      <div class="privateaverage" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        AUCTION
                      </div>
                      <div class="auction" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        TRADE AVERAGE
                      </div>
                      <div class="tradeaverage" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        TRADE POOR
                      </div>
                      <div class="tradepoor" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;">
                        NOT AVAILABLE
                      </div>
                    </div>
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));grid-gap:0px 50px;background:#2f2e2a;padding:0.5rem 0.5rem 1rem 0.5rem;color:white;justify-items:center;text-align:center;">
                    VDI VALUATIONS ARE CREATED FROM REAL WORLD SELLING PRICES
                  </div>
                </div>
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>
                <div class="reportmainfullvdimot reportbasicmot" id="reportbasicmothistorylist" style="display:grid;grid-template-rows:auto auto;justify-self:center;width:100%;">
                  <div class="reportbasicmottitle" style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                    MOT HISTORY LIST
                  </div>
                  <div class="reportbasicmotrecords" style="display:grid;">
                    <div class="reportbasicmotnorecord" style="display:grid;grid-template-rows: auto auto;background:#2f2e2a;padding:0 0.5rem 0.5rem;">
                      <div class="reportbasicmottime" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      </div>
                      <script defer>
                        let reportbasicmottime = "NO RECORDED MOT ENTRIES FOUND TILL "+(new Date()).getDate()+"-"+((new Date()).getMonth()+1)+"-"+(new Date()).getFullYear();
                        document.querySelector(".reportbasicmottime").innerHTML = reportbasicmottime;
                      </script>
                      <div class="reportbasicmotclear" style="display:grid;align-items:center;justify-items:center;background:white;color:black;font-weight:bold;padding:0.5rem;">NO RECORDS
                      </div>
                    </div>
                  </div>
                  <div class="reportbasicmotrecordtemplate" style="display:none;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem 0 0;">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                        RECORD
                      </div>
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                        DETAILS
                      </div>
                    </div>
                    <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0.1rem,auto));grid-gap:0.5rem;justify-items:stretch;background:#2f2e2a;padding:0.5rem;">
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          TEST NUMBER
                        </div>
                        <div class="reportbasicmottestnumber" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          TEST DATE
                        </div>
                        <div class="reportbasicmottestdate" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          EXPIRY DATE
                        </div>
                        <div class="reportbasicmotexpirydate" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          TEST RESULT
                        </div>
                        <div class="reportbasicmottestresult" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ODOMETER READING
                        </div>
                        <div class="reportbasicmotodometerreading" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ODOMETER UNIT
                        </div>
                        <div class="reportbasicmotodometerunit" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ODOMETER IN KILOMETERS
                        </div>
                        <div class="reportbasicmotodometerinkilometers" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ODOMETER IN MILES
                        </div>
                        <div class="reportbasicmotodometerinmiles" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          MILEAGE SINCE LAST PASS
                        </div>
                        <div class="reportbasicmotmileagesincelastpass" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          MILEAGE ANOMALY DETECTED
                        </div>
                        <div class="reportbasicmotmileageanomalydetected" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          DAYS SINCE LAST PASS
                        </div>
                        <div class="reportbasicmotdayssincelastpass" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          DAYS SINCE LAST TEST
                        </div>
                        <div class="reportbasicmotdayssincelasttest" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          DAYS OUT OF MOT
                        </div>
                        <div class="reportbasicmotdaysoutofmot" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          IS RETEST
                        </div>
                        <div class="reportbasicmotisretest" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ADVISORY NOTICE COUNT
                        </div>
                        <div class="reportbasicmotadvisorynoticecount" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          DANGEROUS FAILURE COUNT
                        </div>
                        <div class="reportbasicmotdangerousfailurecount" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          MAJOR FAILURE COUNT
                        </div>
                        <div class="reportbasicmotmajorfailurecount" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          HAS EXTENSION PERIOD
                        </div>
                        <div class="reportbasicmothasextensionperiod" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          EXTENSION PERIOD REASON
                        </div>
                        <div class="reportbasicmotextensionperiodreason" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          EXTENSION PERIOD ADDITIONAL DAYS
                        </div>
                        <div class="reportbasicmotextensionperiodadditionaldays" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          EXTENSION PERIOD ORIGINAL DUE DATE
                        </div>
                        <div class="reportbasicmotextensionperiodoriginalduedate" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ADVISORY NOTICE LIST
                        </div>
                        <div class="reportbasicmotadvisorynoticelist" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          FAILURE REASON LIST
                        </div>
                        <div class="reportbasicmotfailurereasonlist" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          ANNOTATION DETAILS LIST
                        </div>
                        <div class="reportbasicmotannotationdetailslist" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="basicsectionunregistered">
                <div style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                  BASIC REPORT
                </div>
                <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;padding:0.5rem;" onclick="window.location.href='/account/login'">
                  <input name="paymentbasic" type="submit" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;" value="ORDER BASIC REPORT (£2.49 ONLY)">
                </div>
              </div>
              <div class="reportfull" style="display:grid;grid-gap: 0.5rem;">
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>
                <div class="reportfullsummary" id="reportfullchecksummary" style="display:grid;grid-template-rows:auto auto;justify-self:center;width:100%;">
                  <div class="reportfullsummarytitle" style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">FULL CHECK SUMMARY
                  </div>
                  <div class="reportfullsummarydata" style="display:grid;grid-template-columns: auto auto auto;background:#2f2e2a;padding:0.5rem;">
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VRM
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MODEL
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      FUEL TYPE
                    </div>
                    <div class="vrm3" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="model3" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="fuel3" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MAKE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      ENGINE CAPACITY
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      COLOR
                    </div>
                    <div class="make3" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="engine3" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="color3" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="reportfullsummarydatamanufacture" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      YEAR OF MANUFACTURE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE FIRST REGISTERED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIN LAST 5
                    </div>
                    <div class="yearofmanufacture" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="firstregistered" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="vinlast5" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      WRITE OFF RECORD COUNT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      LOOKUP STATUS MESSAGE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      MILEAGE RECORD COUNT
                    </div>
                    <div class="writeoffrecordcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="lookupstatusmessage" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="mileagerecordcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="reportfullsummarydataimportused" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      IMPORT USED BEFORE UK REGISTRATION
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIC TEST DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN INFO SOURCE
                    </div>
                    <div class="importusedbeforeukregistration" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="victestdate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="stoleninfosource" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PREVIOUS COLOR
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN STATUS
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PREVIOUS KEEPER COUNT
                    </div>
                    <div class="previouscolor" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="stolenstatus" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="previouskeepercount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      WRITEOFF DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      IMPORT DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN POLICE FORCE
                    </div>
                    <div class="writeoffdate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="importdate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="stolenpoliceforce" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      LOOKUP STATUS CODE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      CERTIFICATE OF DESTRUCTION ISSUED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATA
                    </div>
                    <div class="lookupstatuscode" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="certificateofdestruction" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="data" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      WRITEOFF CATEGORY
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;text-align:center;">
                      COLOR CHANGE COUNT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      HIGH RISK RECORD COUNT
                    </div>
                    <div class="writeoffcategory" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="colorchangecount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="highriskrecordcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      IMPORTED FROM OUTSIDE EU
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      LATEST V5C ISSUED DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN
                    </div>
                    <div class="importedfromoutsideeu" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="latestv5cissueddate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="stolen" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      MILEAGE ANOMALY DETECTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PREVIOUS KEEPERS
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIC TEST RESULT
                    </div>
                    <div class="mileageanomalydetected" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="previouskeepers" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="victestresult" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="reportfullsummarydatadateregister" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      DATE OF FIRST REGISTRATION IN UK
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      VIC TESTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN DATE
                    </div>
                    <div class="dateoffirstregistrationinuk" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="victested" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="stolendate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      LATEST KEEPER CHANGE DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN CONTACT NUMBER
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      FINANCE RECORD COUNT
                    </div>
                    <div class="latestkeeperchangedate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="stolencontactnumber" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="financerecordcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      PLATE CHANGE COUNT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      SCRAP DATE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      EXPORT DATE
                    </div>
                    <div class="platechangecount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="scrapedate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="exportdate" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      STOLEN MIAFTR RECORD COUNT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      GEAR COUNT
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                    </div>
                    <div class="stolenmiaftrrecordcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="gearcount" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="reportfullsummarydatatransmissiontype" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      TRANSMISSION TYPE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      SCRAPPED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      WRITTEN OFF
                    </div>
                    <div class="transmissiontype" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="scrapped" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="writtenoff" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      IMPORTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      EXPORTED
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                    </div>
                    <div class="imported" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div class="exported" style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;text-align:center;">
                      NOT AVAILABLE
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;font-weight:bold;padding:0.5rem;background:white;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                    <div style="font-weight:bold;padding:0.5rem;">
                    </div>
                  </div>
                </div>
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>
                <div class="reportfullplates platerecordlist" id="reportfullplatetransferlist" style="display:grid;grid-template-rows:auto auto;justify-self:center;width:100%;">
                  <div style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">PLATE TRANSFER LIST
                  </div>
                  <div style="display:grid;grid-template-rows: auto auto;grid-gap:0px 50px;background:#2f2e2a;padding:0.5rem;">
                    <div class="platerecords" style="display:grid;">
                      <div class="platenorecord" style="display:grid;">
                        <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                          NO REGISTRATION TRANSFERS RECORDED FOR THIS VEHICLE
                        </div>
                        <div style="display:grid;align-items:center;justify-items:center;background:white;color:black;padding:0.5rem;font-weight:bold;text-align:center;">
                          TRANSFERS CLEAR
                        </div>
                      </div>
                    </div>
                    <div class="platerecordtemplate" style="display:none;">
                      <div class="platerecordtemplatetitle" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                          RECORD
                        </div>
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                          DETAILS
                        </div>
                      </div>
                      <div class="platerecordtemplatemain" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0.1rem,auto));grid-gap:0.5rem;justify-items:stretch;background:#2f2e2a;padding:0rem 0.5rem 0rem 0.5rem;">
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                          <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                            PREVIOUS VRM
                          </div>
                          <div class="platepreviousvrm" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                            NOT AVAILABLE
                          </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                          <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                            DATE CHANGED
                          </div>
                          <div class="platedatechanged" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                            NOT AVAILABLE
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>
                <div class="reportfullkeeper" id="reportfullkeeperchangelist" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(1rem,auto));justify-self:center;width:100%;">
                  <div style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                    KEEPER CHANGE LIST
                  </div>
                  <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(1rem,auto));grid-gap:0px 50px;background:#2f2e2a;color:white;padding:0.5rem;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));justify-items:stretch;padding:0.5rem;grid-gap:0.5rem;">
                      <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(1rem,auto));grid-gap:0.5rem;">
                        <div style="display:grid;justify-items:stretch;">
                          <div style="display:grid;justify-items:center;text-align:center;">
                            KEEPER CHANGED
                          </div>
                        </div>
                        <div style="display:grid;justify-items:stretch;background:white;color:black">
                          <div style="display:grid;justify-items:center;font-weight:bold;text-align:center;">
                            NOT AVAILABLE
                          </div>
                        </div>
                      </div>
                      <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(1rem,auto));grid-gap:0.5rem;">
                        <div style="display:grid;justify-items:stretch;">
                          <div style="display:grid;justify-items:center;text-align:center;">
                            PREVIOUS KEEPERS
                          </div>
                        </div>
                        <div style="display:grid;justify-items:stretch;background:white;color:black">
                          <div style="display:grid;justify-items:center;font-weight:bold;text-align:center;">
                            NOT AVAILABLE
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style="display:grid;align-items:center;justify-items:center;color:white;padding:0.5rem;text-align:center;">
                      DATE OF ORIGINAL PURCHASE: NOT AVAILABLE
                    </div>
                  </div>
                </div>
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>
                <div class="reportfullfinance financerecordlist" id="reportfullfinancerecordlist" style="display:grid;grid-template-rows:auto auto;justify-self:center;background:#2f2e2a;padding:0 0 0.5rem 0;width:100%;">
                  <div style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                    FINANCE RECORDS LIST
                  </div>
                  <div class="financerecords" style="display:grid;">
                    <div class="financenorecord" style="display:grid;grid-template-rows: auto auto;background:#2f2e2a;padding:0 0.5rem 0.5rem;">
                      <div class="financetime" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      </div>
                      <script defer>
                        let financetime = "NO RECORDED FINANCE ENTRIES FOUND TILL "+(new Date()).getDate()+"-"+((new Date()).getMonth()+1)+"-"+(new Date()).getFullYear();
                        document.querySelector(".financetime").innerHTML = financetime;
                      </script>
                      <div class="financeclear" style="display:grid;align-items:center;justify-items:center;background:white;color:black;font-weight:bold;padding:0.5rem;">FINANCE CLEAR
                      </div>
                    </div>
                  </div>
                  <div class="financerecordtemplate" style="display:none;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));grid-gap:0.5rem;background:#2f2e2a;padding:0.5rem;">
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                        RECORD
                      </div>
                      <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;color:white;text-align:center;">
                        DETAILS
                      </div>
                    </div>
                    <div style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0.1rem,auto));grid-gap:0.5rem;justify-items:stretch;background:#2f2e2a;padding:0rem 0.5rem 0rem 0.5rem;">
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          AGREEMENT DATE
                        </div>
                        <div class="agreementdate" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          AGREEMENT TYPE
                        </div>
                        <div class="agreementtype" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          AGREEMENT TERM
                        </div>
                        <div class="agreementterm" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          AGREEMENT NUMBER
                        </div>
                        <div class="agreementnumber" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          FINANCE COMPANY
                        </div>
                        <div class="financecompany" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          CONTACT NUMBER
                        </div>
                        <div class="contactnumber" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,auto));">
                        <div style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          VEHICLE DESCRIPTION
                        </div>
                        <div class="vehicledescription3" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                          NOT AVAILABLE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="reportpagebreak" style="display:none;">
                  &nbsp;
                </div>
                <div class="reportfullmileage mileagerecordlist" id="reportfullmileagerecordlist" style="display:grid;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-self:center;width:100%;">
                  <div style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">MILEAGE RECORDS LIST
                  </div>
                  <div class="mileagerecords" style="display:grid;">
                    <div class="mileagenorecord" style="display:grid;grid-template-rows: auto auto;background:#2f2e2a;padding:0 0.5rem 0.5rem;">
                      <div class="mileagetime" style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;color:white;padding:0.5rem;text-align:center;">
                      </div>
                      <script defer>
                        let mileagetime = "NO RECORDED MILEAGE RECORDS FOUND TILL "+(new Date()).getDate()+"-"+((new Date()).getMonth()+1)+"-"+(new Date()).getFullYear();
                        document.querySelector(".mileagetime").innerHTML = mileagetime;
                      </script>
                      <div class="mileageclear" style="display:grid;align-items:center;justify-items:center;background:white;color:black;font-weight:bold;padding:0.5rem;text-align:center;">
                        NO RECORDS
                      </div>
                    </div>
                  </div>
                  <div class="mileagerecordtemplate" style="display:none;">
                    <div class="mileagerecordtemplatetitle" style="display:grid;grid-template-columns: auto auto auto;grid-gap:0px 0.1rem;background:#2f2e2a;padding:0.5rem;font-size:1rem;">
                      <div style="display:grid;align-items:center;justify-items:center;color:white;padding:0.5rem;text-align:center;">
                        DATE
                      </div>
                      <div style="display:grid;align-items:center;justify-items:center;color:white;padding:0.5rem;text-align:center;">
                        SOURCE
                      </div>
                      <div style="display:grid;align-items:center;justify-items:center;color:white;padding:0.5rem;text-align:center;">
                        MILEAGE
                      </div>
                    </div>
                    <div class="mileagerecordtemplatemain" style="display:grid;grid-template-columns:repeat(3,minmax(0,auto));grid-gap:0.5rem 0px;justify-items:stretch;background:#2f2e2a;padding:0px 0.5rem 0.5rem 0.5rem;font-size:1rem;">
                      <div class="mileagedate" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;padding:0 0.5rem 0 0;font-weight:bold;text-align:center;">
                        NOT AVAILABLE
                      </div>
                      <div class="mileagesource" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;font-weight:bold;text-align:center;">
                        NOT AVAILABLE
                      </div>
                      <div class="mileagemileage" style="display:grid;align-items:center;justify-items:center;padding:0.5rem;background:white;padding:0 0 0 0.5rem;font-weight:bold;text-align:center;">
                        NOT AVAILABLE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="reportfullunregistered" style="display:grid;">
                <div style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                  FULL REPORT
                </div>
                <div style="display:grid;align-items:center;justify-items:center;background:#2f2e2a;padding:0.5rem;" onclick="window.location.href='/account/login'">
                  <input name="paymentbasic" type="submit" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;" value="ORDER FULL REPORT (£7.99 ONLY)">
                </div>
              </div>
              <div id="packagessection" class="reportprinthide reportpackages" style="display:grid;justify-self:center;">
                <script defer>
                  window.document.querySelector(".reportpackages").appendChild(window.document.querySelector(".packages").cloneNode(true)); //// true: clone this node and also its decendents. false: clone this node but not its descendents.
                </script>
              </div>
            </div>
            <div class="reporterror" style="display:none;justify-self:start;width:100%;">
              <div class="reporterrortitle" style="background:#f9d441;color:black;padding:0.5rem;font-size:1.5rem;">
                ERROR
              </div>
              <div class="reporterrorcaption" style="display:grid;grid-auto-flow:column;justify-content:start;align-self:end;background:#2f2e2a;color:white;padding:0.5rem;font-size:1.5rem;font-weight:bold;border-bottom: 2px solid white;">
                <div style="font-size:1.5rem;">
                  THIS VEHICLE REGISTRATION NUMBER DOES NOT EXIST:
                </div>
                <div class="reportregno" style="font-weight:bold;font-size:1.5rem;padding-left:0.5rem;">
                  NOT AVAILABLE
                </div>
              </div>
              <div class="reporterrordetails" style="display:grid;grid-template-columns:auto auto;background:#2f2e2a;align-items:end;color:white;padding:0.5rem;">
                Please Add Correct Vehicle Number Or Contact Us For Support.
              </div>
            </div>
          </div>
          <style>
            @media screen and (min-width: 551px){
              .report{
                display:grid;
                grid-template-columns:1fr 3fr;
                margin-top: 4.5rem;
                width:100%;
              }
            }
            @media screen and (max-width: 551px){
              .report{
                display:grid;
                grid-auto-flow:row;
                margin-top:4rem;
                width:96vw;
                font-size:0.8rem;
              }
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
              }
              .report{
                display:block !important;
                grid-auto-flow:row !important;
                width:100% !important;
              }
              .reportmain{
                display:block !important;
              }
              .reportbasic{
                display:block !important;
              }
              .reportfull{
                display:block !important;
              }
              .reportpagebreak{
                display:block !important;
                page-break-after:always !important;
              }
              .reportlogo{
                display:grid !important;
              }
              .reportmain{
              }
              .reportfree{
                display:block !important;
                page-break-after: page !important;
              }
              .reportbasicregistration{
                display:block !important;
                page-break-after: page !important;
              }
              .reportbasicvaluation{
              }
              .reportbasicmot{
              }
              .reportfullsummary{
              }
              .reportfullplates{
              }
              .reportfullkeeper{
              }
              .reportfullfinance{
              }
              .reportfullmileage{
              }
              .reportprinthide{
                display:none !important;
              }
            }
            @page { 
              size: A4 portrait !important; 
              margin: 2cm 1cm 2cm 2cm !important;
              -webkit-print-color-adjust: exact !important;   /* Chrome, Safari, Edge */
              color-adjust: exact !important;                 /*Firefox*/
            }
          </style>
          <div class="checkoutpage" style="display:none;">
            <form method="post" action="/checkout">
            <div class="checkoutmain" style="display:grid;grid-auto-flow:column;justify-content:center;justify-items:center;grid-gap:0.5rem;margin:0.5rem;">
                <input type="submit" name="paymentbasic" value="Basic VIS Report" style="border:0;padding:0.5rem;background:#f9d441;font-weight:bold;cursor:pointer;">
                <input type="submit" name="paymentfull" value="Full VIS Report" style="border:0;padding:0.5rem;background:#f9d441;font-weight:bold;cursor:pointer;">
                <input type="submit" name="paymentmulti" value="Multiple VIS Reports" style="border:0;padding:0.5rem;background:#f9d441;font-weight:bold;cursor:pointer;">
            </div>
            </form>
            <div class="checkoutmessage" style="display:none;background:#d6d6d6;">
              <div class="checkoutmessagetrue" style="font-weight:bold;color:red;">
                Thankyou for the payment. 
                  <div style="display:inline-grid;white-space:nowrap;">
                    <a href="/login" style="white-space:nowrap;">
                      Click here to go to the Accounts page.
                    </a>
                  </div>
                </div>
              <div class="checkoutmessagefalse" style="font-weight:bold;color:red;">
                Checkout was not completed.
                <div style="display:inline-grid;white-space:nowrap;">
                  <a href="/login" style="white-space:nowrap;">
                    Click here to go to the Accounts page.
                  </a>
                </div>
              </div>            
            </div>
          </div>
          <div class="contact" style="display:none;justify-items:center;grid-gap:0.5rem;">
            <div class="contactbackground" style="background-image:url('contactbackground.jpg');background-size:cover;font-weight:bold;font-size:4rem;text-align:center;width:100%;">
              <div style="margin-left:4rem;">
                Contact a Member
              </div>
              <div style="margin-left:4rem;font-size:2rem;font-weight:normal;">
                of the Team
              </div>
            </div>
            <style>
              @media all and (min-width: 551px){
                .contactbackground{
                  padding:20rem 0;
                }
              }
              @media all and (max-width: 551px){
                .contactbackground{
                  background-position:center;
                  padding:3rem 0;
                }
              }
            </style>
            <div class="contactstatement" style="display:grid;">
              <div class="contactstatementtext" style="margin:0.5rem;padding:0.5rem;">
                If you have any question or would like to comment on our service or an industry issue, please contact us. We would like to hear from you.
              </div>
              <div class="contactstatementenvelope" style="display:grid;justify-items:center;justify-self:center;width:80%;">
                <img class="contactenvelopeimage" src="/contactenvelope.jpg" loading="lazy">
              </div>
            </div>
            <style>
              @media all and (min-width: 551px){
                .contactstatement{
                  grid-template-columns: 2fr 1fr;
                  width:60%;
                }
                .contactenvelopeimage{
                  width:200px;
                }
              }
              @media all and (max-width: 551px){
                .contactstatement{
                  grid-auto-flow: row;
                }
              }
            </style>
            <div style="background-color:#f9d441;padding:0.5rem;width:calc(100% - 2rem);border-radius:0.5rem;text-align:center;font-weight:bold;font-size:2rem;">
              Contact Form
            </div>
            <div class="contactform" style="display:grid;grid-auto-flow:row;justify-content:center;">
              <form id="contactform" action="/contact" method="post">
              </form>
              <div class="contactformname" style="display:grid;justify-items:center;">
                <input class="contactformnametext" type="text" name="name" form="contactform" placeholder="Name" required style="padding:1rem;margin:0.5rem;outline:none;border:0;border-radius:0.5rem;background:#e7e7e7;font-size:1.5rem;">
              </div>
              <div class="contactformemail" style="display:grid;justify-items:center;">
                <input class="contactformemailtext" type="email" name="email" form="contactform" placeholder="Email" required style="padding:1rem;margin:0.5rem;outline:none;border:0;border-radius:0.5rem;background:#e7e7e7;font-size:1.5rem;">
              </div>
              <div class="contactformmessage" style="display:grid;justify-items:center;">
                <textarea class="contactformmessagetext" rows="10" name="message" form="contactform" placeholder="Message" required style="padding:1rem;margin:0.5rem;outline:none;border:0;border-radius:0.5rem;background:#e7e7e7;font-size:1.5rem;width:calc(100% - 3rem);"></textarea>
              </div>
              <div style="display:grid;justify-items:end;">
                <input type="submit" form="contactform" style="padding:1rem;margin:0.5rem;background-color:#f9d441;font-size:1.5rem;border:0;cursor:pointer;border-radius:0.5rem;" value="Send">
              </div>
              <script defer>
                window.addEventListener("load",contactformresize);
                window.addEventListener("resize",contactformresize);
                function contactformresize () {
                  let width = Math.min(window.innerWidth,screen.width); //window.innerWidth works on Desktop only, screen.width works on mobiles only.
                  if(width < 1000){
                    document.querySelector(".contactformnametext").removeAttribute("size");
                    document.querySelector(".contactformemailtext").removeAttribute("size");
                    document.querySelector(".contactformmessagetext").removeAttribute("rows");
                  }
                  if(width >= 1000){
                    document.querySelector(".contactformnametext").setAttribute("size","80");
                    document.querySelector(".contactformemailtext").setAttribute("size","80");
                    document.querySelector(".contactformmessagetext").setAttribute("rows","10");
                  }
                }
              </script>
            </div>
            <div class="contactmessage" style="display:none;grid-template-rows:repeat(auto-fit,minmax(0,auto));justify-self:center;margin:0.5rem;padding:0.5rem;font-size:1.5rem;color:red;font-weight:bold;text-align:justify;">
              We have received your message, and we will contact back soon.
            </div>
          </div>
          <div class="about" style="display:none;">
            <div class="abouttitle" style="background-image:url('aboutbackground.jpg');background-size:cover;text-align:center;font-weight:bold;font-size:4rem;width:100%;">
              <div class="abouttitletext">
                About Us
              </div>
            </div>
            <style>
              @media all and (min-width: 551px){
                .abouttitle{
                  padding:20rem 0;
                }
              }
              @media all and (max-width: 551px){
                .abouttitle{
                  padding:5rem 0;
                }
              }
            </style>
            <div class="aboutstatement" style="background:rgb(214, 214, 214);margin:1rem;padding:1rem;border-radius:0.5rem;">
              <div style="text-align:center;margin:0.5rem;padding:0.5rem;">
                Vehicle Information Systems (VIS) Check provides vehicle history reports. Over time, we have built a strong reputation for credibility
                and trust.
              </div>
              <div style="text-align:center;margin:0.5rem;padding:0.5rem;">
                VIS Check is one of the largest provider of technology-driven data solutions in the automotive market,
                combining industry and unique data sets to create innovative and powerful vehicle information reports to help their customers.
              </div>
            </div>
            <div class="aboutgenuine" style="display:grid;padding:0.5rem;margin:0.5rem;">
              <div class="aboutgenuinetext">
                <div style="padding:0.5rem 0.5rem 0 0.5rem;margin:0.5rem 0.5rem 0 0.5rem;font-weight:bold;font-size:2rem;">
                  The Genuine Article
                </div>
                <div class="aboutgenuinetextparagraph" style="padding:0 0.5rem 0.5rem 0.5rem;margin:0.5rem;">
                  Not all car history checks are VIS Checks. In fact, VIS Check is a registered trademark. Always look for
                  VIS logos and stamps to make sure you are buying a genuine VIS Check, not a cheap copy.          
                </div>
              </div>
              <div class="aboutgenuineimage" style="display:grid;justify-items:start;">
                <img src="/about1.png" style="background:grey url('/about1.png') cover;" loading="lazy">
              </div>
            </div>
            <div class="aboutvalues" style="display:grid;padding:0.5rem;margin:0.5rem;">
              <div class="aboutgenuinetext" style="display:inline;">
                <div style="padding:0.5rem 0.5rem 0 0.5rem;margin:0.5rem 0.5rem 0 0.5rem;font-weight:bold;font-size:2rem;">
                  Our Values
                </div>
                <div class="aboutvaluestextparagraph" style="padding:0 0.5rem 0.5rem 0.5rem;margin:0.5rem;">
                  As the pioneer of the Vehicle History Check Service, we are working tirelessly to gather the most accurate
                  information about UK vehicle history and provide consumers with the most comprehensive check on the
                  market. VIS check will always tell you where you are with your Vehicle History.
                </div>
              </div>
              <div class="aboutgenuineimage" style="display:inline;">
                <img src="/about2.png" style="background:grey url('/abou2.png') cover;" loading="lazy">
              </div>
            </div>
            <div class="aboutfuture" style="display:grid;padding:0.5rem;margin:0.5rem;">
              <div class="aboutfuturetext" style="display:inline;">
                <div style="padding:0.5rem 0.5rem 0 0.5rem;margin:0.5rem 0.5rem 0 0.5rem;font-weight:bold;font-size:2rem;">
                  Our Future
                </div>
                <div class="aboutfuturetextparagraph" style="padding:0 0.5rem 0.5rem 0.5rem;margin:0.5rem;">
                  We strive to be at the forefront of the industry and continue to invest in state-of-the-art technology and
                  highly reliable processes to ensure that our data quality is excellent.
                </div>
              </div>
              <div class="aboutgenuineimage" style="display:inline;">
                <img src="/about3.png" style="background:grey url('/about3.png') cover;" loading="lazy">
              </div>
            </div>
          </div>
          <div class="privacy" style="display:none;">
            <div class="privacybackground" style="background-image:url('privacybackground.jpg');background-size:cover;font-weight:bold;font-size:3rem;color:white;text-align:center;width:100%;">
            </div>
            <style>
              @media all and (min-width: 551px){
                .privacybackground{
                  text-align:center;
                  padding:20rem 0;
                }
              }
              @media all and (max-width: 551px){
                .privacybackground{
                  padding:5rem 0;
                }
              }
            </style>
            <div class="privacyintro" style="padding:0.5rem;margin:0.5rem;">
              <div style="display:grid;text-align:center;padding:0.5rem;margin:0 0.5rem 0.5rem 0.5rem;font-weight:bold;font-size:2rem;background:#f9d441;border-radius:0.5rem;">
                What is this Privacy Policy for?
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                This privacy policy is for VISTEK - <a href="https://vehicleinformationsystems.com" style="text-decoration:underline;color:blue;">https://vehicleinformationsystems.com</a> and served by UK Vehicle Data Ltd and governs the privacy of its users who choose to use it.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                The policy identifies the various areas where user privacy is concerned and outlines the responsibilities and requirements of users, the website and website owners. In addition, the way this website processes, stores and protects user data and information will be described in this policy.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;font-weight:bold;">
                Purpose of this privacy notice
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                The purpose of this Privacy Notice is to provide you with information on how Vischeck collects and processes your personal data through the use of our websites and services, including any data that you provide to the websites and services. Can provide when you sign up for our newsletter, buy a product or service or participate in a contest.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                The websites and services we run are not intended for children and we do not intentionally collect child-related data.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                It is important that you read this Privacy Notice along with any other Privacy Notice, Consent Notice, or Fair Processing Notice that we may provide from time to time on specific occasions when we are collecting personal data about you or Are being processed so that you are fully aware. How and why we are using your data. This Privacy Notice complements the other notices and is not intended to override them.            
              </div>
              <div style="padding:0.5rem;margin:0.5rem;font-weight:bold;">
                Third-party links            
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Websites and services may include links to third party websites, plugins, and applications that are not operated by us. Clicking on these links or enabling these connections may allow the third party to collect or share data about you. We do not control these third party websites, plugins, or applications and are not responsible for their privacy statements. When you leave our website, we strongly encourage you to read the privacy notice of each website you visit. We have no control over or accept responsibility for the content, privacy policies, or practices of any third party sites or services.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;font-weight:bold;">
                The data we collect about you            
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Personal data, or personal information, means any information about a person that can identify that person. It does not include data from which the identity has been removed (anonymous data).
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                We may collect, use, store and transmit a variety of personal data about you that we have grouped together:
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Identity Data:
                </div>
                <div style="display:inline;">
                  Commonly applicable include name, username or similar identifier, marital status, title, date of birth, gender.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Contact Data:
                </div>
                <div style="display:inline;">
                  Commonly applicable limits include billing address, delivery address, postcode, email address, and telephone number.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Financial Data:
                </div>
                <div style="display:inline;">
                  Commonly applicable limits include bank account and payment card details.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Transaction Data:
                </div>
                <div style="display:inline;">
                  Commonly to the extent applicable Includes details about you and the payments made by you and other details of the products and services you purchased from us.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Technical Data:
                </div>
                <div style="display:inline;">
                  Commonly applicable limits include Internet Protocol (IP) address, your login data, browser type and version, time zone configuration and location, browser plugin types and versions, operating system and platform and other technologies. On the devices you use. Access this website.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Profile Data:
                </div>
                <div style="display:inline;">
                  Commonly applicable range includes your username and password, your purchases or orders, your interests, preferences, feedback and survey responses.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Usage Data:
                </div>
                <div style="display:inline;">
                  In general, the applicable range includes information about how you use our website, products, and services.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Marketing and Communications Data:
                </div>
                <div style="display:inline;">
                  In generally applicable ranges include Your preferences and your communications preferences in getting marketing from us and our third parties.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                In addition, we can collect, use, store and transfer the vehicle's vehicle registration mark ("VRM") and vehicle identification number ("VIN").
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                We also collect, use and share aggregated data such as statistical or demographic data for any purpose. Aggregate data may be derived from your personal data but by law, it is not considered personal data as this data does not directly or indirectly reveal your identity. For example, we may collect your usage data to calculate the percentage of users who have access to a particular feature of the website. However, if we associate or combine aggregate data with your personal data so that it may directly or indirectly identify you, we treat aggregate data as personal data that is used in accordance with this Privacy Notice. Is. Will be done.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                We do not collect any specific category of personal data about you (including your race or ethnicity, religious or philosophical beliefs, sex life, sexual orientation, political views, trade union membership, your health). Information and includes genetic and biometric data). Nor do we collect information about criminal convictions and crimes.            
              </div>
              <div style="padding:0.5rem;margin:0.5rem;font-weight:bold;">
                Use of Cookies
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                This website uses cookies to enhance the user experience while visiting the website. Where applicable, this website uses a cookie control system that does not allow the user to use cookies on their computer / device on their first visit to the website. It complies with the requirements of recent legislation for websites to obtain explicit consent from users before leaving or reading files such as cookies on a user's computer / device.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Cookies are small files stored on a user's computer hard drive that track, store, and store information about user interactions and website usage. This allows the website to provide a seamless experience to users through its server. Users are advised that if they wish to refuse the use of cookies from this website and save it to their computer's hard drive, they should contact the website and its external serving vendors within the security settings of their web browser. Necessary steps must be taken to block all cookies.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                This website uses tracking software to help its visitors better understand how they use it. This software is provided by Google Analytics which uses cookies to track visitor usage. This software will store a cookie on your computer's hard drive to track and monitor your engagement and website usage, but will not store, store or store personal information. You can read more about VISTEK's privacy policy at https://vehicleinformationsystems.com/privacy.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Other cookies may be stored on your computer's hard drive by external vendors when this website uses referral programs, sponsored links, or advertisements. Such cookies are used to track conversions and referrals and usually expire after 30 days, although some may take longer. No personal information is stored, protected or stored.            
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Functional Cookies:
                </div>
                <div style="display:inline;">
                  These cookies allow you to navigate around your websites and use all of their options. Without them, the website would not work as it should.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Analytics and Performance Cookies:
                </div>
                <div style="display:inline;">
                  They help us to improve the way our website works so that we can offer better performance. They tell us how each page is used, which is the most viewed, and whether any errors are reported.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Customization Cookies:
                </div>
                <div style="display:inline;">
                  These cookies remember the basic information you entered into the site, so the next time you visit our website, it's all there for you. We do not store personal information in cookies.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Targetting Cookies:
                </div>
                <div style="display:inline;">
                  These cookies help ensure that the ads you see on your browser are relevant and useful to you because the cookie knows what you're looking for.
                </div>
              </div>
            </div>
            <div class="privacycontact" style="padding:0.5rem;margin:0.5rem;">
              <div style="display:grid;text-align:center;padding:0.5rem;margin:0 0.5rem 0.5rem 0.5rem;font-weight:bold;font-size:2rem;background:#f9d441;border-radius:0.5rem;">
                Contact & Communication
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Users and/or its owners who contact this website do so at their own discretion and provide any such personal details requested at their own risk. Your personal information is kept private and secure until it is no longer needed or of any use, as detailed in the Data Protection Act 1998. Every effort has been made to ensure a secure and secure form for the email submission process, but users are advised. Using a form to process emails that they do at their own risk.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                The websites and services we run are not intended for children and we do not intentionally collect child-related data.
              </div>
            </div>
            <div class="privacysecurity" style="padding:0.5rem;margin:0.5rem;">
              <div style="display:grid;text-align:center;padding:0.5rem;margin:0 0.5rem 0.5rem 0.5rem;font-weight:bold;font-size:2rem;background:#f9d441;border-radius:0.5rem;">
                Data Security
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                We have taken appropriate security measures to prevent your personal data from being accidentally lost, used, or unauthorized access, alteration, or disclosure. In addition, we restrict access to your personal data to employees, agents, contractors, and other third parties who need to know the business. They will only process your personal data at our direction and are subject to a duty of confidentiality.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                VIS Check recognizes the importance of secure online transactions, and we protect the privacy of information we provide through online forms. We use a digital certificate to assure you the accuracy of our site and for online requests from users, we provide VIS Check with strong encryption for the data you provide on the order form before transmission. Secure Sockets use Layer technology.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                We have developed procedures for dealing with any suspected personal data breach and will notify you and any applicable regulator of the breach where we are required to do so legally.
              </div>
            </div>
            <div class="privacylegal" style="padding:0.5rem;margin:0.5rem;">
              <div style="display:grid;text-align:center;padding:0.5rem;margin:0 0.5rem 0.5rem 0.5rem;font-weight:bold;font-size:2rem;background:#f9d441;border-radius:0.5rem;">
                Your Legal Rights
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Request Access:
                </div>
                <div style="display:inline;">
                  To your personal data (commonly known as the "data subject access request"). This enables you to obtain a copy of the personal data we hold about you and to check that we are processing it legally.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Request Correction:
                </div>
                <div style="display:inline;">
                  The personal data we hold about you. This enables you to correct any incomplete or incorrect data we hold about you, although we may need to verify the accuracy of the new data you provide.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Request Erasure:
                </div>
                <div style="display:inline;">
                  Of your personal data. This enables you to ask us to delete personal data where we have no good reason to continue processing it. You also have the right to ask us to delete your personal data where you have successfully exercised your right to object to the processing, where we have made your information illegal. Take action or where we need to delete your personal data. Obey local law. However, note that we may not always be able to comply with your removal request for specific legal reasons, which will notify you at the time of your request, if applicable.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Object to Processing:
                </div>
                <div style="display:inline;">
                  Your personal data where we are relying on a legitimate interest (or that of a third party) and there is something about your particular situation that makes you want to object to acting on that basis because you feel That it affects your fundamental rights and freedoms. . You also have the right to ask where we are acting on your personal data for direct marketing purposes. In some cases, we may show that we have strong legitimate grounds for processing your information that infringes on your rights and freedoms.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Request restriction of processing:
                </div>
                <div style="display:inline;">
                  Of your personal data. This enables you to ask us to suspend the processing of your personal data in the following scenarios: (a) if you want us to establish the accuracy of the data; (b) Where our use of data is illegal but you do not want us to delete it; (c) Where you need to keep our data even if we no longer need it as you need it to establish, use or defend legal claims. Or (d) you have objected to our use of your data but we need to confirm whether we have a valid basis for using it.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Request the transfer:
                </div>
                <div style="display:inline;">
                  Your personal data to you or a third party. We will provide you, or any third party of your choice, with your personal data in an organized, commonly used, machine-readable format. Note that this right only applies to the automatic information that you initially agreed to use with us or where we used the information to enter into an agreement with you.
                </div>
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <div style="display:inline;font-weight:bold;">
                  Withdraw concent at any time:
                </div>
                <div style="display:inline;">
                  Where we are relying on your consent to process your personal data. However, it will not affect the legitimacy of any action taken before your consent is withdrawn. If you withdraw your consent, we may not be able to provide you with certain products or services. If this happens when you withdraw your consent, we will advise you.
                </div>
              </div>
            </div>
          </div>
          <div class="terms" style="display:none;">
            <div class="termsbackground" style="background-image:url('termsbackground.jpg');background-size:cover;background-position:center;width:100%;">
            </div>
            <style>
              @media all and (min-width: 551px){
                .termsbackground{
                  padding:20rem 0;
                }
              }
              @media all and (max-width: 551px){
                .termsbackground{
                  padding:10rem 0;
                }
              }
            </style>
            <div class="termscontent" style="padding:0.5rem;margin:0.5rem;">
              <div style="padding:0.5rem;margin:0.5rem;">
                Services UK Vehicle Data Services Ltd. ("We" and "We") are owned and operated. The data we provide
                to you is provided to us through various third party sources. When you use this service you are subject to
                these terms and conditions (the 'terms') and you have agreed to be legally bound by them.        
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                If it does not agree with you, you should not use our service.
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                You agree that you are not in any position with Motor Trade. Our service is only for customers who want
                to purchase a car for their personal use. If any member of Motor Trade uses this site, we do not
                guarantee any date provided to you. You agree that while using our Service, you will not use any
                automated software or system to extract data from us in any other way than receiving our report.        
              </div>
              <div style="padding:0.5rem 0.5rem 0;margin:0.5rem 0.5rem 0;font-weight:bold;">
                The following details of our terms of business with you:
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                <ol style="overflow-x:visible;">
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    You agree to be bound by these Terms unconditionally.
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    We use reasonable and prudent measures to ensure that the information you provide is accurate.
                    We do not guarantee that the information we provide you is accurate. We provide this data to you
                    on an "as is" basis and our sole representation to you is that it is an accurate copy of the
                    information provided to us.            
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    We take reasonable steps to ensure that our data is regularly updated. You acknowledge and
                    agree that the data we receive (such as from DVLA, insurance companies, police, etc.) should be
                    processed within a reasonable time before it becomes available to you. We want to present any
                    data in a maximum of 8 working hours.
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    We have no control over how our third party providers provide data or how long it may take them
                    to do so. We will provide you with the latest data available to us.            
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    We guarantee that the data we provide you will accurately reflect the data that we collect and / or
                    receive from third parties. This exclusively does not exclude any liability on our part for the
                    accuracy of the data held by third parties which we report and we do not specifically accept any
                    liability for any error. Which may be contained within the data unless it is covered by us.
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    You believe that the data provided by us should be used in all acceptable and prudent ways when
                    buying a motor vehicle and our data should not be relied upon in isolation. You should not
                    assume that our data indicates that the vehicle has any special value, other than the data that we
                    may provide to you as published data of specific models in pre-rated conditions.
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    There are risks involved in purchasing a motor vehicle and our service is just one step you can
                    take to protect yourself from people who may misrepresent the vehicle or try to deceive you. Our
                    data cannot identify a "colored" or "cloned" vehicle. These are vehicles with incorrect number
                    plates and / or VIN numbers. We do not offer any compensation or guarantee if your purchased
                    vehicle was showing incorrect number plates when you purchased data from us.            
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    Stolen vehicles can only be exchanged for you if the registration number of the vehicle you
                    provided to us has been registered by the police as a report of theft.
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    LIMITATION OF LIABILITY AND LIMITATION OF RESPONSIBILITY As set forth in these Terms
                    of the Website apply to us, our Directors, Employees, Agents, and / or other Agents equally and
                    separately.            
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    We do not restrict your legal rights as a user by enforcing these Terms.
                  </li>
                  <li style="padding:0 0 0.5rem 0.5rem;margin:0 0 0.5rem 0;overflow-x:visible;">
                    If you request a report of a vehicle on which the police have reported the theft, we send your
                    details to the police and you agree that we can do so.
                  </li>
                </ol>
              </div>
              <div style="padding:0.5rem 0.5rem 0;margin:0.5rem 0.5rem 0;font-weight:bold;">
                Our Intellectual Property
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Any names, product names, titles, software, routines, and copyrights that we use to provide our services
                to you are our property or licensed. You may not copy, reproduce, redistribute, publish, transfer, display,
                tweak, edit, create or remove or reuse any such content as a result of our use of the Service. Can get,
                except where we give you special permission. to do so. Unauthorized use may be illegal.        
              </div>
              <div style="padding:0.5rem 0.5rem 0;margin:0.5rem 0.5rem 0;font-weight:bold;">
                England, Scotland and Wales (Territory)
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Our service is for the use of area residents. You cannot use our service if you are not a resident of the
                area. By using our Services, you represent that your residence complies with our Terms of Use.
              </div>
              <div style="padding:0.5rem 0.5rem 0;margin:0.5rem 0.5rem 0;font-weight:bold;">
                General
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                The agreement reached through our agreement to fulfill your request for data check is between you and
                the United States and is for your use only. You may not provide this information to any third party and if
                you violate these Terms, the Third Party will not be liable for the seizure of the data provided by us to you.
                Our data does not give you any indication of the condition of the road or the general condition of any
                vehicle you have checked. You have no right to cancel the contract and the Consumer Protection
                (Distance Sales) Rules 2000 do not apply. These Terms contain the full terms of the Agreement between
                us and you.
              </div>
              <div style="padding:0.5rem 0.5rem 0;margin:0.5rem 0.5rem 0;font-weight:bold;">
                Law
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Our Terms of Service and your use of these Terms will be governed by the laws of England and you agree
                to be subject to the jurisdiction of the English Courts in any dispute between you and us
              </div>
              <div style="padding:0.5rem 0.5rem 0;margin:0.5rem 0.5rem 0;font-weight:bold;">
                Claims
              </div>
              <div style="padding:0.5rem;margin:0.5rem;">
                Any claim made by you under these Terms or our Additional Guarantee will be determined by the
                arbitrator appointed by us at our discretion.
              </div>
            </div>
          </div>
          <div class="footer reportprinthide" style="border-top: 0.1rem solid grey;margin-top:1rem;">
            <div class="footersection1" style="justify-items:stretch;align-items:stretch;justify-content:stretch;align-content:stretch;grid-gap:0.5rem;">
              <div class="footersection1logo" style="justify-self:start;align-self:start;white-space:nowrap;">
                <img class="logo" src="/logo.jpg" style="margin:0.5rem;background:grey url('/logo.jpg') cover;"  alt="vistek logo" loading="lazy">
              </div>
              <div style="justify-self:start;align-self:start;margin:0.5rem;">
                <div style="display:grid;grid-template-rows: auto auto auto auto auto;grid-gap:5px;align-items:start;">
                  <div style="white-space: nowrap;font-size:90%;font-family: 'Roboto', sans-serif;font-weight: bold;">YOUR ACCOUNT</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/account/register'">Register an Account</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/#packages'">VIS Check Pricing</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/account/login'">Account Login</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/dashboard/reports'">VIS Dashboard</div>
                </div>
              </div>
              <div style="justify-self:start;align-self:start;margin:0.5rem;">
                <div style="display:grid;grid-template-rows: auto auto auto auto auto;grid-gap:5px;">
                  <div style="white-space: nowrap;font-size:90%;font-family: 'Roboto', sans-serif;font-weight: bold;">QUICK LINKS</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/'">Home</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/#services'">Services</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/about'">About Us</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/contact'">Contact Us</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/privacy'">Privacy Policy</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;cursor:pointer;" onclick="window.location.href='/terms'">Terms & Conditions</div>
                </div>
              </div>
              <div style="justify-self:start;align-self:start;margin:0.5rem;">
                <div style="display:grid;grid-template-rows: auto auto auto;grid-gap:5px;">
                  <div style="white-space: nowrap;font-size:90%;font-family: 'Roboto', sans-serif;font-weight: bold;">FOLLOW US</div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;justify-self:start;align-self:start;">
                    <img style="width:20px;height:20px;" src="/footerfacebook.png" alt="facebook icon" style="background:grey url('/footerfacebook.png') cover;" loading="lazy">
                  </div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;justify-self:start;align-self:start;">
                    <img style="width:20px;height:20px;" src="/footertwitter.png" alt="twitter icon" style="background:grey url('/footertwitter.png') cover;" loading="lazy">
                  </div>
                  <div style="font-size:90%;font-family: 'Roboto', sans-serif;justify-self:start;align-self:start;">
                    <img style="width:20px;height:20px;" src="/footerinstagram.png" alt="instagram icon" style="background:grey url('/footerinstagram.png') cover;" loading="lazy">
                  </div>
                </div>
              </div>
            </div>
            <div class="footersection2" style="display:grid;justify-items:center;border-top: 0.1rem solid grey;width:100%;">
              <div class="footersection2year" style="display:grid;margin:0.5rem;">
              </div>
              <script defer>
                document.querySelector(".footersection2year").innerHTML = "Copyright © "+new Date().getFullYear()+" VIS Check - All Rights Reserved.";
              </script>
            </div>
          </div>
          <div class="cookie reportprinthide" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(0,auto));justify-content:stretch;grid-gap:0.5rem;padding:0.5rem;width:100vw;position:fixed;bottom:0;background:#2f2e2a;color:white;z-index:3;">
            <div class="cookietitle" style="display:grid;justify-items:start;align-items:center;">
              By using this website, you automatically accept that we use cookies.
            </div>
            <div class="cookieclose" style="display:grid;justify-items:end;align-items:center;font-size:1rem;cursor:pointer;">
              X
            </div>
            <script defer>
              window.addEventListener("load",()=>{
                if(Number((document.cookie.match('(^|; )'+'cookie'+'=([^;]*)')||0)[2])) document.querySelector(".cookie").style.display = "none";
              });
              document.querySelector(".cookieclose").addEventListener("click",()=>{
                document.cookie = "cookie=1";
                document.querySelector(".cookie").style.display = "none";
              });
            </script>
          </div>

        </div>
      </body>
    </html>
    `;

  //"return" only returns from the immediate function, not outer function. Thus, express never ends its session in nested function when return is called. Only solution is to use local variable to store that information. 
  if (!req.sent) {
    req.sent = 1;
    res.send(dom);
  }
  if(req.cookies.user) console.log("--------------------------------"); //only log the loggedin user, otherwise spam bots also log.
});

//last rest point and catch all.
app.use(/.*/, function (req, res, next) {
  if (!req.sent) res.redirect("/");
});