import superagent from "superagent";

superagent
          .get("https://uk1.ukvehicledata.co.uk/api/datapackage/VdiCheckFull?v=2&api_nullitems=1&auth_apikey=C3BC75FB-2A5D-4246-8FA8-92B76B9B2AE6&key_VRM=BD51SMR")
          .then(res => {
              if(!Object.keys(res.body.Response.DataItems).length) console.log("true");
          });