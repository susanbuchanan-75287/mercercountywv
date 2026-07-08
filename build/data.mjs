// Mercer County Commission — site content (real data scraped from mercercountywv.com, owner-authorized)
export const county = {
  name: "Mercer County Commission",
  short: "Mercer County",
  tagline: "A Shining Community in the Mountains of Appalachia",
  address: "1501 West Main Street, Princeton, WV 24740",
  courthouse: "Mercer County Courthouse",
  phone: "(304) 487-8306",
  phoneRaw: "+13044878306",
  hours: "Monday–Friday, 8:30 AM – 4:30 PM",
  founded: 1837,
  seat: "Princeton",
  visitUrl: "https://susanbuchanan-75287.github.io/visit-mercer-county-wv/",
  cvbUrl: "https://visitmercercounty.com/"
};

export const commissioners = [
  {
    name: "Bill Archer", initials: "BA", role: "Commission President",
    region: "", term: "Current — signs the Commission's 2026 official notices as President",
    bio: "Commissioner Bill Archer serves as President of the Mercer County Commission for 2026. A longtime advocate for the county, he presides over commission meetings and represents residents across Mercer County."
  },
  {
    name: "Greg Puckett", initials: "GP", role: "Commissioner (Region III)",
    region: "Region III", term: "Terms: 2015–2020, 2021–2026",
    bio: "A native southern West Virginian and alumnus of Princeton Senior High and Concord College, Greg Puckett is Executive Director of Community Connections Inc. He helped re-establish the County Planning Commission, launched the award-winning Keep Mercer Clean campaign, invested nearly $2M in the county park, and paid off the regional-jail debt. He serves on the NACo Board of Directors and earned the National Public Leadership in the Arts Award (2021) and the Louis Gorin Award for rural health (2020)."
  },
  {
    name: "Brian Blankenship", initials: "BB", role: "Commissioner",
    region: "", term: "Current term",
    bio: "Commissioner Brian Blankenship serves on the Mercer County Commission, focusing on infrastructure, public safety and responsible stewardship of county resources on behalf of all residents."
  }
];

export const offices = [
  { id:"assessor", icon:"🏠", name:"Assessor", phone:"(304) 487-8397",
    where:"Courthouse · 1501 W Main St, Princeton",
    desc:"Fairly values all real estate and personal property in the county — homes, land, commercial buildings and vehicles — the basis for property taxes. Provides homestead, veterans and senior exemptions plus online property records and tax maps." },
  { id:"county-clerk", icon:"📜", name:"County Clerk", phone:"(304) 487-8338",
    where:"Suite 121, Courthouse · Princeton",
    desc:"Fiscal officer and custodian of official records: elections and voter registration, probate, vital records (birth, death, marriage), hunting & fishing licenses, notary and civil-service services, payroll and county budgeting. Photo ID is required to vote in WV." },
  { id:"circuit-clerk", icon:"⚖️", name:"Circuit Clerk", phone:"",
    where:"Courthouse · Princeton",
    desc:"A constitutional office (WV Const. Art. 8, §9), elected to six-year terms. Registrar, recorder and custodian of all Circuit and Family Court pleadings, manages the county jury system, and assists self-represented litigants." },
  { id:"sheriff", icon:"🚔", name:"Sheriff & Tax Office", phone:"",
    where:"Courthouse · Princeton",
    desc:"Law enforcement, service of civil process, operation of the county jail, and collection of real-estate and personal-property taxes. Blends time-honored values with modern public-safety strategies to safeguard the community." },
  { id:"prosecuting-attorney", icon:"🏛️", name:"Prosecuting Attorney", phone:"",
    where:"Courthouse · Princeton",
    desc:"Prosecutes felony and misdemeanor criminal cases on behalf of the State of West Virginia and advises county government, working closely with law enforcement and the courts." },
  { id:"circuit-court", icon:"👨‍⚖️", name:"Circuit Court Judges", phone:"",
    where:"Courthouse · Princeton",
    desc:"The Circuit Court hears felony criminal cases and major civil matters for the county's judicial circuit." },
  { id:"family-court", icon:"👪", name:"Family Court Judges", phone:"",
    where:"Courthouse · Princeton",
    desc:"Handles divorce, custody, child and spousal support, and other domestic-relations matters." },
  { id:"magistrate", icon:"📋", name:"Magistrate Court", phone:"",
    where:"Magistrate Court · Princeton",
    desc:"Handles misdemeanors, small claims, arrest and search warrants, and emergency protective orders." }
];

export const agencies = [
  { id:"911", icon:"📟", name:"Mercer County 911", contact:"Emergencies: 911",
    desc:"The Mercer Communications Center is the Public Safety Answering & Dispatch Point for police, fire, EMS and emergency management countywide — processing 911 and non-emergency calls promptly and professionally to help save lives and protect property." },
  { id:"emergency", icon:"🚨", name:"Emergency Management (OES)", contact:"",
    desc:"Disaster preparedness, response coordination and public-safety planning for Mercer County." },
  { id:"animal-shelter", icon:"🐾", name:"Animal Shelter", contact:"(304) 425-2838 · 961 Shelter Road, Princeton", href:"animal-shelter.html",
    desc:"An open-admission county shelter (Director Stacy Harman) providing humane care for stray and relinquished animals. Accepts animals from county residents; all pets are spayed/neutered before adoption; rescue-friendly with 501(c)(3) partners." },
  { id:"health", icon:"🏥", name:"Health Department", contact:"Clinic: Blue Prince Family Health",
    desc:"Empowers residents to live healthy lives in healthy communities. Full clinic services via Blue Prince Family Health: primary and preventative care, wellness and cancer screenings, immunizations and vaccines." },
  { id:"airport", icon:"✈️", name:"Mercer County Airport", contact:"(304) 327-8440 · 300 Markell Dr, Ste 201, Bluefield",
    desc:"General-aviation airport (Manager Jim Pilkins) serving the greater Bluefield/Princeton region under the oversight of the County Commission." },
  { id:"recycling", icon:"♻️", name:"Recycling Program", contact:"749 Frontage Road, Princeton (Landfill)",
    desc:"Drop-off recycling at the Sanitary Landfill. Hours: Mon–Fri 7 AM–5 PM, Sat 8 AM–1 PM. Accepts #1 & #2 plastics, ferrous metals & cans, all aluminum, and bagged paper / broken-down cardboard (materials must be separated)." },
  { id:"day-report", icon:"🗂️", name:"Day Report Center", contact:"",
    desc:"Community-based alternative sentencing and supervision programs." },
  { id:"corrections", icon:"🔒", name:"Corrections / Regional Jail", contact:"",
    desc:"Coordination with the Southern Regional Jail and inmate services." },
  { id:"adult-probation", icon:"🧭", name:"Adult Probation", contact:"",
    desc:"Supervision of adults on probation within the judicial circuit." },
  { id:"juvenile-probation", icon:"🧑‍🎓", name:"Juvenile Probation", contact:"",
    desc:"Supervision and services for juveniles under court jurisdiction." },
  { id:"floodplain", icon:"🌊", name:"Floodplain Management", contact:"",
    desc:"Floodplain permitting and compliance with FEMA/NFIP development standards." },
  { id:"litter", icon:"🗑️", name:"Litter Control / Keep Mercer Clean", contact:"",
    desc:"The county's nationally recognized, award-winning litter-control and community-cleanup initiative." },
  { id:"parks", icon:"🏞️", name:"Mercer County Park & Parks", contact:"",
    desc:"County park facilities, ballfields, pool and recreation across the county." },
  { id:"cvb", icon:"🧳", name:"Convention & Visitors Bureau", contact:"visitmercercounty.com",
    desc:"Promotes tourism and travel to Mercer County." },
  { id:"development", icon:"📈", name:"Development Authority", contact:"",
    desc:"Economic development, business recruitment and workforce initiatives." },
  { id:"fair", icon:"🎡", name:"County Fair", contact:"",
    desc:"The annual Mercer County Fair and associated community events." },
  { id:"education", icon:"🎓", name:"Education / Schools", contact:"",
    desc:"Links to Mercer County Schools and WVU Extension services." },
  { id:"hatfield", icon:"🛣️", name:"Hatfield-McCoy Trails", contact:"",
    desc:"Access to the region's renowned ATV/OHV trail system." }
];

export const boards = [
  { icon:"💧", name:"Public Service Districts", desc:"Bluewell, Bramwell, Green Valley–Glenwood, Lashmeet and Oakvale PSDs providing water & sewer service." },
  { icon:"✈️", name:"Airport Authority", desc:"Governs operations and development of the Mercer County Airport." },
  { icon:"♻️", name:"Solid Waste Authority", desc:"Oversees solid-waste planning, recycling and litter programs." },
  { icon:"🗺️", name:"Planning Commission", desc:"Land-use planning, subdivision review and long-range county planning." },
  { icon:"🏥", name:"Board of Health", desc:"Governs the county Health Department and public-health policy." },
  { icon:"📟", name:"911 Advisory Board", desc:"Advises on emergency-communications operations and addressing." },
  { icon:"🔥", name:"Fire Board", desc:"Coordinates and supports the county's volunteer fire departments." },
  { icon:"🏗️", name:"Building Commission", desc:"Holds and finances county-owned buildings and facilities." },
  { icon:"🏛️", name:"Civil Service Commission", desc:"Administers civil-service processes for eligible county employees." },
  { icon:"📈", name:"Development Authority Board", desc:"Directs economic-development strategy and incentives." },
  { icon:"🧳", name:"CVB Board", desc:"Governs the Convention & Visitors Bureau and tourism marketing." },
  { icon:"🏚️", name:"Dilapidated Structures Committee", desc:"Reviews and prioritizes unsafe-structure abatement cases." },
  { icon:"🏞️", name:"Glenwood Park Board", desc:"Oversees Glenwood Recreational Park facilities." },
  { icon:"🛡️", name:"Public Defender Board", desc:"Supports indigent-defense services in the county." },
  { icon:"🌐", name:"Region One Planning & Development", desc:"Regional development council serving southern West Virginia counties." },
  { icon:"🛣️", name:"King Coal & Coal Heritage Highway Authorities", desc:"Advance major regional highway corridors and heritage tourism." },
  { icon:"🤝", name:"Southern Regional Community Corrections", desc:"Regional alternative-sentencing and reentry programming." },
  { icon:"👷", name:"WV Workforce Board", desc:"Workforce development and job-training coordination." }
];

export const ordinances = [
  { icon:"🏚️", name:"Dilapidated Buildings", desc:"Standards and process for addressing unsafe and derelict structures." },
  { icon:"🎆", name:"Fireworks", desc:"Regulation of the sale and use of consumer fireworks in the county." },
  { icon:"🌊", name:"Floodplain Management", desc:"Development standards within designated floodplain areas." },
  { icon:"🗑️", name:"Litter Control", desc:"Prohibitions on illegal dumping supporting the Keep Mercer Clean campaign." },
  { icon:"🔊", name:"Noise Ordinance", desc:"Limits on excessive noise to protect residential neighborhoods." },
  { icon:"🎭", name:"Exotic Entertainment", desc:"Licensing and locational standards for adult-oriented businesses." },
  { icon:"🧠", name:"Mental Hygiene", desc:"Local procedures related to mental-hygiene proceedings." }
];

// Seed content (also served/overridden by the live API when deployed)
export const news = [
  { date:"2026-06-24", tag:"Recycling", title:"Free Tire Disposal Days 2026", body:"Residents may drop off up to 10 passenger tires per household at no charge at the Mercer County Landfill (749 Frontage Rd), 9 AM–2 PM on scheduled dates April through November. No disposal December–February." },
  { date:"2026-03-03", tag:"Recycling", title:"Recycling Schedule — April 2026", body:"Updated curbside and drop-off recycling routes for April." },
  { date:"2026-02-12", tag:"Press Release", title:"Pocahontas Waterline Replacement Update", body:"Progress on the ongoing Pocahontas waterline replacement project, including affected areas and expected timelines." },
  { date:"2026-02-02", tag:"Press Release", title:"2026 Board of Review & Equalization Hearing Schedule", body:"The Commission, sitting as the Board of Review & Equalization, has set its 2026 property-assessment review hearing schedule." },
  { date:"2026-01-22", tag:"Press Release", title:"Seeking Letters of Interest — Prosecuting Attorney", body:"The Commission is accepting letters of interest for the position of Prosecuting Attorney. Applicants must hold a degree from an accredited law school." },
  { date:"2026-01-05", tag:"Press Release", title:"2026 Mercer County Commission Meeting Schedule", body:"The full 2026 schedule of agenda and regular commission meetings is now available." }
];

// Meeting pattern: agenda 1st Tue 10:00; regular 2nd Tue 10:00 & 4th Tue 3:30
export const meetings = [
  { date:"2026-07-07", time:"10:00 AM", type:"Agenda Meeting", status:"upcoming" },
  { date:"2026-07-14", time:"10:00 AM", type:"Commission Meeting", status:"upcoming" },
  { date:"2026-07-28", time:"3:30 PM", type:"Commission Meeting", status:"upcoming" },
  { date:"2026-06-23", time:"3:30 PM", type:"Commission Meeting", status:"past", minutes:true, video:true },
  { date:"2026-06-09", time:"10:00 AM", type:"Commission Meeting", status:"past", minutes:true, video:true },
  { date:"2026-05-26", time:"3:30 PM", type:"Commission Meeting", status:"past", minutes:true }
];

export const nav = [
  { href:"index.html", label:"Home" },
  { href:"government.html", label:"Government" },
  { href:"offices.html", label:"Offices" },
  { href:"agencies.html", label:"Agencies" },
  { href:"boards.html", label:"Boards" },
  { href:"meetings.html", label:"Meetings" },
  { href:"news.html", label:"News" },
  { href:"contact.html", label:"Contact" }
];

export const quicklinks = [
  { href:"offices.html#sheriff", icon:"💵", label:"Pay Property Taxes" },
  { href:"offices.html#assessor", icon:"🏠", label:"Property Assessment" },
  { href:"meetings.html", icon:"🎥", label:"Watch Meetings" },
  { href:"notices.html", icon:"📢", label:"Public Notices" },
  { href:"government.html#careers", icon:"💼", label:"Jobs & Bids" },
  { href:"offices.html#county-clerk", icon:"🗳️", label:"Voter Registration" },
  { href:"agencies.html#recycling", icon:"♻️", label:"Recycling" },
  { href:"contact.html#foia", icon:"📄", label:"Records / FOIA" }
];

export const policies = [
  { id:"accessibility", title:"Accessibility Statement" },
  { id:"content-disclaimer", title:"Content Disclaimer" },
  { id:"legal-notices", title:"Legal Notices" },
  { id:"link-policy", title:"Link Policy" },
  { id:"privacy-policy", title:"Privacy Policy" },
  { id:"security-policy", title:"Security Policy" }
];
