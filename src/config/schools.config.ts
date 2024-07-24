import { SchoolId } from '../enum';

export interface School {
    id: SchoolId;
    name: string;
    mascot: string;
    conference: string;
}

export const SCHOOLS: School[] = [
    { name: 'Air Force', mascot: 'Falcons', conference: 'Mountain West', id: SchoolId.AIR_FORCE },
    { name: 'Akron', mascot: 'Zips', conference: 'MAC', id: SchoolId.AKRON },
    { name: 'Alabama', mascot: 'Crimson Tide', conference: 'SEC', id: SchoolId.ALABAMA },
    {
        name: 'Appalachian State',
        mascot: 'Mountaineers',
        conference: 'Sun Belt',
        id: SchoolId.APPALACHIAN_STATE
    },
    { name: 'Arizona', mascot: 'Wildcats', conference: 'BIG 12', id: SchoolId.ARIZONA },
    {
        name: 'Arizona State',
        mascot: 'Sun Devils',
        conference: 'BIG 12',
        id: SchoolId.ARIZONA_STATE
    },
    { name: 'Arkansas', mascot: 'Razorbacks', conference: 'SEC', id: SchoolId.ARKANSAS },
    {
        name: 'Arkansas State',
        mascot: 'Red Wolves',
        conference: 'Sun Belt',
        id: SchoolId.ARKANSAS_STATE
    },
    { name: 'Army', mascot: 'Black Knights', conference: 'American', id: SchoolId.ARMY },
    { name: 'Auburn', mascot: 'Tigers', conference: 'SEC', id: SchoolId.AUBURN },
    { name: 'Ball State', mascot: 'Cardinals', conference: 'MAC', id: SchoolId.BALL_STATE },
    { name: 'Baylor', mascot: 'Bears', conference: 'Big 12', id: SchoolId.BAYLOR },
    {
        name: 'Boise State',
        mascot: 'Broncos',
        conference: 'Mountain West',
        id: SchoolId.BOISE_STATE
    },
    { name: 'Boston College', mascot: 'Eagles', conference: 'ACC', id: SchoolId.BOSTON_COLLEGE },
    { name: 'Bowling Green', mascot: 'Falcons', conference: 'MAC', id: SchoolId.BOWLING_GREEN },
    { name: 'Buffalo', mascot: 'Bulls', conference: 'MAC', id: SchoolId.BUFFALO },
    { name: 'BYU', mascot: 'Cougars', conference: 'Big 12', id: SchoolId.BYU },
    { name: 'California', mascot: 'Golden Bears', conference: 'ACC', id: SchoolId.CALIFORNIA },
    {
        name: 'Central Michigan',
        mascot: 'Chippewas',
        conference: 'MAC',
        id: SchoolId.CENTRAL_MICHIGAN
    },
    { name: 'Charlotte', mascot: '49ers', conference: 'American', id: SchoolId.CHARLOTTE },
    { name: 'Cincinnati', mascot: 'Bearcats', conference: 'Big 12', id: SchoolId.CINCINNATI },
    { name: 'Clemson', mascot: 'Tigers', conference: 'ACC', id: SchoolId.CLEMSON },
    {
        name: 'Coastal Carolina',
        mascot: 'Chanticleers',
        conference: 'Sun Belt',
        id: SchoolId.COASTAL_CAROLINA
    },
    { name: 'Colorado', mascot: 'Buffaloes', conference: 'BIG 12', id: SchoolId.COLORADO },
    {
        name: 'Colorado State',
        mascot: 'Rams',
        conference: 'Mountain West',
        id: SchoolId.COLORADO_STATE
    },
    { name: 'Duke', mascot: 'Blue Devils', conference: 'ACC', id: SchoolId.DUKE },
    {
        name: 'East Carolina',
        mascot: 'Pirates',
        conference: 'American',
        id: SchoolId.EAST_CAROLINA
    },
    {
        name: 'Eastern Michigan',
        mascot: 'Eagles',
        conference: 'MAC',
        id: SchoolId.EASTERN_MICHIGAN
    },
    {
        name: 'Florida Atlantic',
        mascot: 'Owls',
        conference: 'American',
        id: SchoolId.FLORIDA_ATLANTIC
    },
    { name: 'FIU', mascot: 'Panthers', conference: 'C-USA', id: SchoolId.FIU },
    { name: 'Florida', mascot: 'Gators', conference: 'SEC', id: SchoolId.FLORIDA },
    { name: 'Florida State', mascot: 'Seminoles', conference: 'ACC', id: SchoolId.FLORIDA_STATE },
    {
        name: 'Fresno State',
        mascot: 'Bulldogs',
        conference: 'Mountain West',
        id: SchoolId.FRESNO_STATE
    },
    { name: 'Georgia', mascot: 'Bulldogs', conference: 'SEC', id: SchoolId.GEORGIA },
    {
        name: 'Georgia Southern',
        mascot: 'Eagles',
        conference: 'Sun Belt',
        id: SchoolId.GEORGIA_SOUTHERN
    },
    {
        name: 'Georgia State',
        mascot: 'Panthers',
        conference: 'Sun Belt',
        id: SchoolId.GEORGIA_STATE
    },
    {
        name: 'Georgia Tech',
        mascot: 'Yellow Jackets',
        conference: 'ACC',
        id: SchoolId.GEORGIA_TECH
    },
    {
        name: 'Hawaii',
        mascot: 'Rainbow Warriors',
        conference: 'Mountain West',
        id: SchoolId.HAWAII
    },
    { name: 'Houston', mascot: 'Cougars', conference: 'Big 12', id: SchoolId.HOUSTON },
    { name: 'Illinois', mascot: 'Fighting Illini', conference: 'Big Ten', id: SchoolId.ILLINOIS },
    { name: 'Indiana', mascot: 'Hoosiers', conference: 'Big Ten', id: SchoolId.INDIANA },
    { name: 'Iowa', mascot: 'Hawkeyes', conference: 'Big Ten', id: SchoolId.IOWA },
    { name: 'Iowa State', mascot: 'Cyclones', conference: 'Big 12', id: SchoolId.IOWA_STATE },
    {
        name: 'Jacksonville State',
        mascot: 'Gamecocks',
        conference: 'C-USA',
        id: SchoolId.JACKSONVILLE_STATE
    },
    { name: 'James Madison', mascot: 'Dukes', conference: 'Sun Belt', id: SchoolId.JAMES_MADISON },
    { name: 'Kansas', mascot: 'Jayhawks', conference: 'Big 12', id: SchoolId.KANSAS },
    { name: 'Kansas State', mascot: 'Wildcats', conference: 'Big 12', id: SchoolId.KANSAS_STATE },
    { name: 'Kennesaw State', mascot: 'Owls', conference: 'C-USA', id: SchoolId.KENNESAW_STATE },
    { name: 'Kent State', mascot: 'Golden Flashes', conference: 'MAC', id: SchoolId.KENT_STATE },
    { name: 'Kentucky', mascot: 'Wildcats', conference: 'SEC', id: SchoolId.KENTUCKY },
    { name: 'Liberty', mascot: 'Flames', conference: 'C-USA', id: SchoolId.LIBERTY },
    { name: 'Louisiana', mascot: 'Ragin’ Cajuns', conference: 'Sun Belt', id: SchoolId.LOUISIANA },
    {
        name: 'Louisiana–Monroe',
        mascot: 'Warhawks',
        conference: 'Sun Belt',
        id: SchoolId.LOUISIANA_MONROE
    },
    {
        name: 'Louisiana Tech',
        mascot: 'Bulldogs',
        conference: 'C-USA',
        id: SchoolId.LOUISIANA_TECH
    },
    { name: 'Louisville', mascot: 'Cardinals', conference: 'ACC', id: SchoolId.LOUISVILLE },
    { name: 'LSU', mascot: 'Tigers', conference: 'SEC', id: SchoolId.LSU },
    { name: 'Marshall', mascot: 'Thundering Herd', conference: 'Sun Belt', id: SchoolId.MARSHALL },
    { name: 'Maryland', mascot: 'Terrapins', conference: 'Big Ten', id: SchoolId.MARYLAND },
    { name: 'Memphis', mascot: 'Tigers', conference: 'American', id: SchoolId.MEMPHIS },
    { name: 'Miami (FL)', mascot: 'Hurricanes', conference: 'ACC', id: SchoolId.MIAMI },
    { name: 'Miami (OH)', mascot: 'RedHawks', conference: 'MAC', id: SchoolId.MIAMI_OH },
    { name: 'Michigan', mascot: 'Wolverines', conference: 'Big Ten', id: SchoolId.MICHIGAN },
    {
        name: 'Michigan State',
        mascot: 'Spartans',
        conference: 'Big Ten',
        id: SchoolId.MICHIGAN_STATE
    },
    {
        name: 'Middle Tennessee',
        mascot: 'Blue Raiders',
        conference: 'C-USA',
        id: SchoolId.MIDDLE_TENNESSEE
    },
    { name: 'Minnesota', mascot: 'Golden Gophers', conference: 'Big Ten', id: SchoolId.MINNESOTA },
    {
        name: 'Mississippi State',
        mascot: 'Bulldogs',
        conference: 'SEC',
        id: SchoolId.MISSISSIPPI_STATE
    },
    { name: 'Missouri', mascot: 'Tigers', conference: 'SEC', id: SchoolId.MISSOURI },
    { name: 'Navy', mascot: 'Midshipmen', conference: 'American', id: SchoolId.NAVY },
    { name: 'NC State', mascot: 'Wolfpack', conference: 'ACC', id: SchoolId.NC_STATE },
    { name: 'Nebraska', mascot: 'Cornhuskers', conference: 'Big Ten', id: SchoolId.NEBRASKA },
    { name: 'Nevada', mascot: 'Wolf Pack', conference: 'Mountain West', id: SchoolId.NEVADA },
    { name: 'New Mexico', mascot: 'Lobos', conference: 'Mountain West', id: SchoolId.NEW_MEXICO },
    {
        name: 'New Mexico State',
        mascot: 'Aggies',
        conference: 'C-USA',
        id: SchoolId.NEW_MEXICO_STATE
    },
    { name: 'North Carolina', mascot: 'Tar Heels', conference: 'ACC', id: SchoolId.NORTH_CAROLINA },
    { name: 'North Texas', mascot: 'Mean Green', conference: 'American', id: SchoolId.NORTH_TEXAS },
    {
        name: 'Northern Illinois',
        mascot: 'Huskies',
        conference: 'MAC',
        id: SchoolId.NORTHERN_ILLINOIS
    },
    { name: 'Northwestern', mascot: 'Wildcats', conference: 'Big Ten', id: SchoolId.NORTHWESTERN },
    {
        name: 'Notre Dame',
        mascot: 'Fighting Irish',
        conference: 'Independent',
        id: SchoolId.NOTRE_DAME
    },
    { name: 'Ohio', mascot: 'Bobcats', conference: 'MAC', id: SchoolId.OHIO },
    { name: 'Ohio State', mascot: 'Buckeyes', conference: 'Big Ten', id: SchoolId.OHIO_STATE },
    { name: 'Oklahoma', mascot: 'Sooners', conference: 'SEC', id: SchoolId.OKLAHOMA },
    {
        name: 'Oklahoma State',
        mascot: 'Cowboys',
        conference: 'Big 12',
        id: SchoolId.OKLAHOMA_STATE
    },
    { name: 'Old Dominion', mascot: 'Monarchs', conference: 'Sun Belt', id: SchoolId.OLD_DOMINION },
    { name: 'Ole Miss', mascot: 'Rebels', conference: 'SEC', id: SchoolId.OLE_MISS },
    { name: 'Oregon', mascot: 'Ducks', conference: 'Big Ten', id: SchoolId.OREGON },
    { name: 'Oregon State', mascot: 'Beavers', conference: 'Pac-12', id: SchoolId.OREGON_STATE },
    { name: 'Penn State', mascot: 'Nittany Lions', conference: 'Big Ten', id: SchoolId.PENN_STATE },
    { name: 'Pittsburgh', mascot: 'Panthers', conference: 'ACC', id: SchoolId.PITTSBURGH },
    { name: 'Purdue', mascot: 'Boilermakers', conference: 'Big Ten', id: SchoolId.PURDUE },
    { name: 'Rice', mascot: 'Owls', conference: 'American', id: SchoolId.RICE },
    { name: 'Rutgers', mascot: 'Scarlet Knights', conference: 'Big Ten', id: SchoolId.RUTGERS },
    { name: 'Sam Houston', mascot: 'Bearkats', conference: 'C-USA', id: SchoolId.SAM_HOUSTON },
    {
        name: 'San Diego State',
        mascot: 'Aztecs',
        conference: 'Mountain West',
        id: SchoolId.SAN_DIEGO_STATE
    },
    {
        name: 'San Jose State',
        mascot: 'Spartans',
        conference: 'Mountain West',
        id: SchoolId.SAN_JOSE_STATE
    },
    { name: 'SMU', mascot: 'Mustangs', conference: 'ACC', id: SchoolId.SMU },
    {
        name: 'South Alabama',
        mascot: 'Jaguars',
        conference: 'Sun Belt',
        id: SchoolId.SOUTH_ALABAMA
    },
    { name: 'South Carolina', mascot: 'Gamecocks', conference: 'SEC', id: SchoolId.SOUTH_CAROLINA },
    { name: 'South Florida', mascot: 'Bulls', conference: 'American', id: SchoolId.SOUTH_FLORIDA },
    {
        name: 'Southern Miss',
        mascot: 'Golden Eagles',
        conference: 'Sun Belt',
        id: SchoolId.SOUTHERN_MISS
    },
    { name: 'Stanford', mascot: 'Cardinal', conference: 'ACC', id: SchoolId.STANFORD },
    { name: 'Syracuse', mascot: 'Orange', conference: 'ACC', id: SchoolId.SYRACUSE },
    { name: 'TCU', mascot: 'Horned Frogs', conference: 'Big 12', id: SchoolId.TCU },
    { name: 'Temple', mascot: 'Owls', conference: 'American', id: SchoolId.TEMPLE },
    { name: 'Tennessee', mascot: 'Volunteers', conference: 'SEC', id: SchoolId.TENNESSEE },
    { name: 'Texas', mascot: 'Longhorns', conference: 'SEC', id: SchoolId.TEXAS },
    { name: 'Texas A&M', mascot: 'Aggies', conference: 'SEC', id: SchoolId.TEXAS_AM },
    { name: 'Texas State', mascot: 'Bobcats', conference: 'Sun Belt', id: SchoolId.TEXAS_STATE },
    { name: 'Texas Tech', mascot: 'Red Raiders', conference: 'Big 12', id: SchoolId.TEXAS_TECH },
    { name: 'Toledo', mascot: 'Rockets', conference: 'MAC', id: SchoolId.TOLEDO },
    { name: 'Troy', mascot: 'Trojans', conference: 'Sun Belt', id: SchoolId.TROY },
    { name: 'Tulane', mascot: 'Green Wave', conference: 'American', id: SchoolId.TULANE },
    { name: 'Tulsa', mascot: 'Golden Hurricane', conference: 'American', id: SchoolId.TULSA },
    { name: 'UAB', mascot: 'Blazers', conference: 'American', id: SchoolId.UAB },
    { name: 'UCF', mascot: 'Knights', conference: 'Big 12', id: SchoolId.UCF },
    { name: 'UCLA', mascot: 'Bruins', conference: 'Big Ten', id: SchoolId.UCLA },
    { name: 'UConn', mascot: 'Huskies', conference: 'Independent', id: SchoolId.UCONN },
    { name: 'UMass', mascot: 'Minutemen', conference: 'MAC', id: SchoolId.UMASS },
    { name: 'UNLV', mascot: 'Rebels', conference: 'Mountain West', id: SchoolId.UNLV },
    { name: 'USC', mascot: 'Trojans', conference: 'Big Ten', id: SchoolId.USC },
    { name: 'UTEP', mascot: 'Miners', conference: 'C-USA', id: SchoolId.UTEP },
    { name: 'UTSA', mascot: 'Roadrunners', conference: 'American', id: SchoolId.UTSA },
    { name: 'Utah', mascot: 'Utes', conference: 'BIG 12', id: SchoolId.UTAH },
    { name: 'Utah State', mascot: 'Aggies', conference: 'Mountain West', id: SchoolId.UTAH_STATE },
    { name: 'Vanderbilt', mascot: 'Commodores', conference: 'SEC', id: SchoolId.VANDERBILT },
    { name: 'Virginia', mascot: 'Cavaliers', conference: 'ACC', id: SchoolId.VIRGINIA },
    { name: 'Virginia Tech', mascot: 'Hokies', conference: 'ACC', id: SchoolId.VIRGINIA_TECH },
    { name: 'Wake Forest', mascot: 'Demon Deacons', conference: 'ACC', id: SchoolId.WAKE_FOREST },
    { name: 'Washington', mascot: 'Huskies', conference: 'Big Ten', id: SchoolId.WASHINGTON },
    {
        name: 'Washington State',
        mascot: 'Cougars',
        conference: 'Pac-12',
        id: SchoolId.WASHINGTON_STATE
    },
    {
        name: 'West Virginia',
        mascot: 'Mountaineers',
        conference: 'Big 12',
        id: SchoolId.WEST_VIRGINIA
    },
    {
        name: 'Western Kentucky',
        mascot: 'Hilltoppers',
        conference: 'C-USA',
        id: SchoolId.WESTERN_KENTUCKY
    },
    {
        name: 'Western Michigan',
        mascot: 'Broncos',
        conference: 'MAC',
        id: SchoolId.WESTERN_MICHIGAN
    },
    { name: 'Wisconsin', mascot: 'Badgers', conference: 'Big Ten', id: SchoolId.WISCONSIN },
    { name: 'Wyoming', mascot: 'Cowboys', conference: 'Mountain West', id: SchoolId.WYOMING }
];
