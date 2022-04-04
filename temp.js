import pdf from "html-pdf";

let template = `<div class="report" style="display:none;align-items:start;justify-items:center;justify-self:center;grid-gap:0.5rem;width:96%;">
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
              <div class="reportmenuprint reportprinthide" style="display:grid;margin:0.5rem;border-radius:0.5rem;">
                <div class="reportmenuprintbutton" style="display:grid;justify-items:center;align-items:center;background-color:#f9d441;padding:0.5rem;cursor:pointer;font-weight:bold;text-align:center;font-size:1rem;" onclick="window.print()">
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
                      <script defer="">
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
                  <form id="basicsectionunregisteredorder" action="/report" method="post">
                  </form>
                  <button class="basicsectionunregisteredorder" name="basicsectionunregisteredorder" form="basicsectionunregisteredorder" type="submit" value="" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;">
                    ORDER BASIC REPORT (£2.49 ONLY)
                  </button>
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
                      <script defer="">
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
                      <script defer="">
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
                  <form id="fullsectionunregisteredorder" action="/report" method="post">
                  </form>
                  <button class="fullsectionunregisteredorder" name="fullsectionunregisteredorder" form="fullsectionunregisteredorder" type="submit" value="" style="background-color:#f9d441; border-radius:0.5rem;padding:0.5rem;font-weight:bold;border:0px;font-size:1rem;cursor:pointer;margin:0.5rem;">
                    ORDER FULL REPORT (£7.99 ONLY)
                  </button>
                </div>
              </div>
              <div id="packagessection" class="reportprinthide reportpackages" style="display:grid;justify-self:center;">
                <script defer="">
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
          </style>`;

pdf.create(template).toFile("./pdf.pdf", function(err, res){
  console.log(res.filename);
});