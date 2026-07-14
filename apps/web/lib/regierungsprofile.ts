// Werdegänge der Mitglieder der Bundesregierung (Kabinett Merz).
// Quelle sind die amtlichen Biografien (Bundesregierung.de, Bundeskanzler.de,
// Auswärtiges Amt, jeweilige Ministeriumsseiten, Deutscher Bundestag). Die Daten
// werden unverändert übernommen; öffentlich nicht dokumentierte Stationen sind
// bewusst ausgelassen und nicht ergänzt (Regel: nicht raten). Neutral, ohne Wertung.

export interface Station {
  von?: string;
  bis?: string;
  was: string;
  wo?: string;
}

export interface ProfilQuelle {
  label: string;
  url: string;
}

export interface RegierungsProfil {
  name: string;
  slug: string;
  amt: string;
  partei: string;
  geboren?: string;
  imAmtSeit?: string;
  ausbildung: Station[];
  berufVorPolitik: Station[];
  politischeStationen: Station[];
  quellen: ProfilQuelle[];
}

// Bundeskanzler zuerst, danach die Ministerinnen und Minister.
export const REGIERUNGSPROFILE: RegierungsProfil[] = [
  {
    name: "Friedrich Merz",
    slug: "friedrich-merz",
    amt: "Bundeskanzler",
    partei: "CDU",
    geboren: "11.11.1955, Brilon",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { bis: "1975", was: "Abitur", wo: "Rüthen" },
      { von: "1976", bis: "1981", was: "Studium der Rechts- und Staatswissenschaften", wo: "Rheinische Friedrich-Wilhelms-Universität Bonn und Philipps-Universität Marburg" },
      { von: "1982", was: "Erstes juristisches Staatsexamen" },
      { von: "1982", bis: "1985", was: "Rechtsreferendariat", wo: "Landgericht Saarbrücken" },
      { von: "1985", was: "Zweites juristisches Staatsexamen" },
    ],
    berufVorPolitik: [
      { von: "1975", bis: "1976", was: "Wehrdienst" },
      { von: "1985", bis: "1986", was: "Richter", wo: "Amtsgericht Saarbrücken" },
      { von: "1986", was: "Rechtsanwalt" },
      { von: "1986", bis: "1989", was: "Referent", wo: "Verband der Chemischen Industrie e.V." },
      { von: "2005", bis: "2021", was: "Partner, ab 2017 Senior Counsel", wo: "Anwaltskanzlei Mayer Brown LLP" },
    ],
    politischeStationen: [
      { von: "1972", was: "Mitglied der CDU" },
      { von: "1989", bis: "1994", was: "Mitglied des Europäischen Parlaments" },
      { von: "1994", bis: "2009", was: "Mitglied des Deutschen Bundestages" },
      { von: "1998", bis: "2000", was: "Stellvertretender Vorsitzender der CDU/CSU-Bundestagsfraktion" },
      { von: "2000", bis: "2002", was: "Vorsitzender der CDU/CSU-Bundestagsfraktion" },
      { von: "2021", bis: "heute", was: "Mitglied des Deutschen Bundestages" },
      { von: "2022", bis: "heute", was: "Vorsitzender der CDU Deutschlands" },
      { von: "2022", bis: "2025", was: "Vorsitzender der CDU/CSU-Bundestagsfraktion" },
      { von: "06.05.2025", bis: "heute", was: "Bundeskanzler der Bundesrepublik Deutschland" },
    ],
    quellen: [
      { label: "Bundeskanzler.de – Biografie Friedrich Merz", url: "https://www.bundeskanzler.de/bk-de/friedrich-merz/friedrich-merz" },
      { label: "Bundesregierung.de – Friedrich Merz, Bundeskanzler", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/friedrich-merz-2342660" },
    ],
  },
  {
    name: "Lars Klingbeil",
    slug: "lars-klingbeil",
    amt: "Vizekanzler und Bundesminister der Finanzen",
    partei: "SPD",
    geboren: "23.02.1978, Soltau",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1998", was: "Abitur", wo: "Munster" },
      { von: "1999", bis: "2004", was: "Studium der Politischen Wissenschaft, Soziologie und Geschichte (Magister)", wo: "Leibniz Universität Hannover" },
    ],
    berufVorPolitik: [
      { von: "1998", bis: "1999", was: "Zivildienst", wo: "Bahnhofsmission Hannover" },
      { von: "2001", bis: "2003", was: "Mitarbeiter im Wahlkreisbüro von Bundeskanzler Gerhard Schröder und Heino Wiese" },
      { von: "2004", bis: "2005", was: "Jugendbildungsreferent", wo: "SPD-Landesverband Nordrhein-Westfalen" },
      { von: "2005", bis: "2009", was: "Büroleiter von Garrelt Duin, MdB" },
    ],
    politischeStationen: [
      { von: "1996", was: "Mitglied der SPD" },
      { von: "2005", was: "Mitglied des Deutschen Bundestages (seit 2009 kontinuierlich)" },
      { von: "2017", bis: "2021", was: "Generalsekretär der SPD" },
      { von: "2021", bis: "heute", was: "Vorsitzender der SPD" },
      { von: "2025", was: "Vorsitzender der SPD-Bundestagsfraktion" },
      { von: "06.05.2025", bis: "heute", was: "Bundesminister der Finanzen und Stellvertreter des Bundeskanzlers" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Lars Klingbeil, Finanzminister", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lars-klingbeil-2342606" },
    ],
  },
  {
    name: "Alexander Dobrindt",
    slug: "alexander-dobrindt",
    amt: "Bundesminister des Innern",
    partei: "CSU",
    geboren: "07.06.1970, Peißenberg",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1989", was: "Abitur", wo: "Weilheim" },
      { von: "1989", bis: "1995", was: "Studium der Soziologie (Diplom-Soziologe)", wo: "Ludwig-Maximilians-Universität München" },
    ],
    berufVorPolitik: [
      { von: "1996", bis: "2005", was: "Kaufmännischer Leiter, ab 2001 Geschäftsführer eines Maschinenbauunternehmens" },
    ],
    politischeStationen: [
      { von: "1990", was: "Mitglied der CSU" },
      { von: "1996", bis: "2011", was: "Marktgemeinderat Peißenberg" },
      { von: "1996", bis: "2018", was: "Kreisrat Weilheim-Schongau" },
      { von: "2002", bis: "heute", was: "Mitglied des Deutschen Bundestages" },
      { von: "2005", bis: "2008", was: "Wirtschaftspolitischer Sprecher der CSU" },
      { von: "2009", bis: "2013", was: "Generalsekretär der CSU" },
      { von: "2013", bis: "2017", was: "Bundesminister für Verkehr und digitale Infrastruktur" },
      { von: "2017", bis: "2025", was: "Vorsitzender der CSU-Landesgruppe und stellvertretender Vorsitzender der CDU/CSU-Bundestagsfraktion" },
      { von: "06.05.2025", bis: "heute", was: "Bundesminister des Innern" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Lebenslauf Alexander Dobrindt", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342792" },
      { label: "Bundesregierung.de – Alexander Dobrindt, Innenminister", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/alexander-dobrindt-2342806" },
    ],
  },
  {
    name: "Johann Wadephul",
    slug: "johann-wadephul",
    amt: "Bundesminister des Auswärtigen",
    partei: "CDU",
    geboren: "10.02.1963, Husum",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1981", was: "Abitur / Allgemeine Hochschulreife" },
      { von: "1986", bis: "1991", was: "Studium der Rechtswissenschaften", wo: "Christian-Albrechts-Universität zu Kiel" },
      { von: "1991", was: "Erste Juristische Staatsprüfung" },
      { von: "1995", was: "Zweite Juristische Staatsprüfung" },
      { von: "1996", was: "Promotion zum Dr. jur.", wo: "Christian-Albrechts-Universität zu Kiel" },
    ],
    berufVorPolitik: [
      { von: "1982", bis: "1986", was: "Zeitsoldat der Bundeswehr" },
      { von: "1995", was: "Rechtsanwalt" },
      { von: "2009", was: "Fachanwalt für Medizin- und Sozialrecht" },
    ],
    politischeStationen: [
      { von: "2000", bis: "2009", was: "Mitglied im Schleswig-Holsteinischen Landtag" },
      { von: "2005", bis: "2009", was: "Vorsitzender der CDU-Landtagsfraktion Schleswig-Holstein" },
      { von: "2009", bis: "heute", was: "Mitglied des Deutschen Bundestages" },
      { von: "2010", bis: "2021", was: "Mitglied im Bundesvorstand der CDU" },
      { von: "2018", bis: "2025", was: "Stellvertretender Vorsitzender der CDU/CSU-Bundestagsfraktion" },
      { von: "06.05.2025", bis: "heute", was: "Bundesminister des Auswärtigen" },
    ],
    quellen: [
      { label: "Auswärtiges Amt – Lebenslauf Außenminister Johann Wadephul", url: "https://www.auswaertiges-amt.de/de/aamt/aussenminister-wadephul/bm-lebenslauf-seite" },
      { label: "Bundesregierung.de – Johann Wadephul, Außenminister", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/johann-wadephul-2342698" },
    ],
  },
  {
    name: "Boris Pistorius",
    slug: "boris-pistorius",
    amt: "Bundesminister der Verteidigung",
    partei: "SPD",
    geboren: "14.03.1960, Osnabrück",
    imAmtSeit: "19. Januar 2023 (im Kabinett Merz seit 6. Mai 2025)",
    ausbildung: [
      { von: "", bis: "1978", was: "Abitur", wo: "Osnabrück" },
      { von: "1978", bis: "1980", was: "Ausbildung zum Groß- und Außenhandelskaufmann" },
      { von: "1980", bis: "1981", was: "Wehrdienst" },
      { von: "1981", bis: "1987", was: "Studium der Rechtswissenschaften", wo: "Universitäten Osnabrück und Münster" },
      { von: "1987", bis: "1987", was: "Erstes juristisches Staatsexamen" },
      { von: "1987", bis: "1990", was: "Referendariat und Zweites juristisches Staatsexamen" },
    ],
    berufVorPolitik: [
      { von: "1990", bis: "1990", was: "Rechtsanwalt" },
      { von: "1991", bis: "1991", was: "Regierungsassessor", wo: "Bezirksregierung Weser-Ems" },
      { von: "1991", bis: "1995", was: "Persönlicher Referent des niedersächsischen Innenministers Gerhard Glogowski", wo: "Niedersächsisches Innenministerium" },
      { von: "1995", bis: "1996", was: "Stellvertretender Leiter des Ministerbüros", wo: "Niedersächsisches Innenministerium" },
      { von: "1997", bis: "2002", was: "Leiter verschiedener Dezernate", wo: "Bezirksregierung Weser-Ems, Osnabrück" },
      { von: "2002", bis: "2006", was: "Leiter des Fachbereichs Schule und Sport", wo: "Stadt Osnabrück" },
    ],
    politischeStationen: [
      { von: "1976", bis: "", was: "Eintritt in die SPD" },
      { von: "1996", bis: "2013", was: "Ratsmitglied der Stadt Osnabrück", wo: "Osnabrück" },
      { von: "1999", bis: "2002", was: "Zweiter Bürgermeister der Stadt Osnabrück", wo: "Osnabrück" },
      { von: "2006", bis: "2013", was: "Oberbürgermeister der Stadt Osnabrück", wo: "Osnabrück" },
      { von: "2013", bis: "2023", was: "Niedersächsischer Minister für Inneres und Sport", wo: "Land Niedersachsen" },
      { von: "2017", bis: "2023", was: "Mitglied des Niedersächsischen Landtags", wo: "Niedersachsen" },
      { von: "2023", bis: "heute", was: "Bundesminister der Verteidigung", wo: "Bundesregierung" },
      { von: "2025", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "Deutscher Bundestag" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Boris Pistorius (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/boris-pistorius-2342862" },
      { label: "BMVg – Lebenslauf Minister", url: "https://www.bmvg.de/en/organisation/minister-of-defence-boris-pistorius/curriculum-vitae" },
      { label: "Deutscher Bundestag – Biografie Boris Pistorius", url: "https://www.bundestag.de/abgeordnete/biografien/P/pistorius_boris-1046550" },
    ],
  },
  {
    name: "Katherina Reiche",
    slug: "katherina-reiche",
    amt: "Bundesministerin für Wirtschaft und Energie",
    partei: "CDU",
    geboren: "16.07.1973, Luckenwalde",
    imAmtSeit: "6. Mai 2025",
    ausbildung: [
      { von: "", bis: "1992", was: "Abitur", wo: "Luckenwalde" },
      { von: "1992", bis: "1997", was: "Diplomstudium der Chemie", wo: "Universität Potsdam" },
      { von: "1995", bis: "1995", was: "Forschungsassistentin", wo: "Clarkson University, New York (USA)" },
      { von: "1997", bis: "1997", was: "Forschungsaufenthalt", wo: "Turku University, Finnland" },
    ],
    berufVorPolitik: [
      { von: "1997", bis: "1998", was: "Wissenschaftliche Mitarbeiterin", wo: "Universität Potsdam" },
      { von: "2015", bis: "2019", was: "Hauptgeschäftsführerin", wo: "Verband kommunaler Unternehmen e.V. (VKU)" },
      { von: "2020", bis: "2025", was: "Vorsitzende des Nationalen Wasserstoffrats" },
      { von: "2020", bis: "2025", was: "Vorstandsvorsitzende", wo: "Westenergie AG" },
    ],
    politischeStationen: [
      { von: "1998", bis: "2015", was: "Mitglied des Deutschen Bundestages", wo: "Deutscher Bundestag" },
      { von: "2005", bis: "2009", was: "Stellvertretende Vorsitzende der CDU/CSU-Bundestagsfraktion" },
      { von: "2009", bis: "2013", was: "Parlamentarische Staatssekretärin beim Bundesminister für Umwelt, Naturschutz und Reaktorsicherheit", wo: "Bundesregierung" },
      { von: "2013", bis: "2015", was: "Parlamentarische Staatssekretärin beim Bundesminister für Verkehr und digitale Infrastruktur", wo: "Bundesregierung" },
      { von: "2025", bis: "heute", was: "Bundesministerin für Wirtschaft und Energie", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Katherina Reiche (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/katherina-reiche-2342740" },
      { label: "Bundesregierung.de – Lebenslauf Katherina Reiche", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342728" },
    ],
  },
  {
    name: "Dorothee Bär",
    slug: "dorothee-baer",
    amt: "Bundesministerin für Forschung, Technologie und Raumfahrt",
    partei: "CSU",
    geboren: "19.04.1978, Bamberg",
    imAmtSeit: "6. Mai 2025",
    ausbildung: [
      { von: "", bis: "1996", was: "High School Diploma", wo: "Grayslake, Illinois (USA)" },
      { von: "", bis: "1999", was: "Abitur", wo: "Bamberg" },
      { von: "1999", bis: "2005", was: "Studium der Politikwissenschaften, Abschluss Diplom-Politologin", wo: "München und Berlin" },
    ],
    berufVorPolitik: [],
    politischeStationen: [
      { von: "1994", bis: "", was: "Eintritt in die CSU" },
      { von: "2001", bis: "heute", was: "Mitglied des CSU-Parteivorstands" },
      { von: "2001", bis: "2003", was: "Landesvorsitzende des Rings Christlich-Demokratischer Studenten (RCDS) in Bayern", wo: "Bayern" },
      { von: "2002", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "Deutscher Bundestag" },
      { von: "2009", bis: "2013", was: "Stellvertretende CSU-Generalsekretärin" },
      { von: "2013", bis: "2018", was: "Parlamentarische Staatssekretärin beim Bundesminister für Verkehr und digitale Infrastruktur", wo: "Bundesregierung" },
      { von: "2018", bis: "2021", was: "Staatsministerin bei der Bundeskanzlerin und Beauftragte der Bundesregierung für Digitalisierung", wo: "Bundeskanzleramt" },
      { von: "2021", bis: "2025", was: "Stellvertretende Vorsitzende der CDU/CSU-Bundestagsfraktion" },
      { von: "2025", bis: "heute", was: "Bundesministerin für Forschung, Technologie und Raumfahrt", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Dorothee Bär (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/dorothee-baer-2342724" },
      { label: "Bundesregierung.de – Lebenslauf Dorothee Bär", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342716" },
      { label: "Deutscher Bundestag – Biografie Dorothee Bär", url: "https://www.bundestag.de/webarchiv/abgeordnete/biografien19/B/baer_dorothee-518098" },
    ],
  },
  {
    name: "Stefanie Hubig",
    slug: "stefanie-hubig",
    amt: "Bundesministerin der Justiz und für Verbraucherschutz",
    partei: "SPD",
    geboren: "15.12.1968, Frankfurt am Main",
    imAmtSeit: "6. Mai 2025",
    ausbildung: [
      { von: "", bis: "1988", was: "Abitur", wo: "München" },
      { von: "1989", bis: "1993", was: "Studium der Rechtswissenschaften", wo: "Universität Regensburg" },
      { von: "1993", bis: "1993", was: "Erstes juristisches Staatsexamen" },
      { von: "", bis: "1995", was: "Zweites juristisches Staatsexamen (Referendariat)" },
    ],
    berufVorPolitik: [
      { von: "1996", bis: "2000", was: "Richterin am Landgericht Ingolstadt und Staatsanwältin bei der Staatsanwaltschaft Ingolstadt", wo: "Ingolstadt" },
      { von: "2000", bis: "2005", was: "Stellvertretende Leiterin des Ministerbüros und Referentin", wo: "Bundesministerium der Justiz" },
      { von: "2005", bis: "2008", was: "Leiterin des Referats für Kabinetts- und Parlamentsangelegenheiten", wo: "Bundesministerium der Justiz" },
      { von: "2008", bis: "2009", was: "Referentin für Justiz", wo: "Staatskanzlei Rheinland-Pfalz" },
      { von: "2009", bis: "2014", was: "Leiterin der Abteilung Strafrecht", wo: "Ministerium der Justiz Rheinland-Pfalz" },
    ],
    politischeStationen: [
      { von: "2014", bis: "2016", was: "Staatssekretärin im Bundesministerium der Justiz und für Verbraucherschutz", wo: "Bundesregierung" },
      { von: "2016", bis: "2025", was: "Staatsministerin für Bildung des Landes Rheinland-Pfalz", wo: "Land Rheinland-Pfalz" },
      { von: "2025", bis: "heute", was: "Bundesministerin der Justiz und für Verbraucherschutz", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Stefanie Hubig (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/stefanie-hubig-2342672" },
      { label: "Bundesregierung.de – Lebenslauf Dr. Stefanie Hubig", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342664" },
    ],
  },
  {
    name: "Karin Prien",
    slug: "karin-prien",
    amt: "Bundesministerin für Bildung, Familie, Senioren, Frauen und Jugend",
    partei: "CDU",
    geboren: "26.06.1965, Amsterdam (Niederlande)",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1984", bis: "1984", was: "Abitur", wo: "Neuwied" },
      { von: "1984", bis: "1989", was: "Studium der Rechtswissenschaft und Politikwissenschaft, Erstes juristisches Staatsexamen", wo: "Bonn" },
      { von: "1990", bis: "1991", was: "Postgraduiertenstudium, LL.M. Internationales Handelsrecht", wo: "Amsterdam" },
      { von: "1991", bis: "1994", was: "Rechtsreferendariat, Zweites juristisches Staatsexamen", wo: "Hannover" },
    ],
    berufVorPolitik: [
      { von: "1994", bis: "heute", was: "Rechtsanwältin (Wirtschafts- und Insolvenzrecht)", wo: "verschiedene Kanzleien" },
      { von: "2008", bis: "heute", was: "Partnerin, Fachanwältin für Handels- und Gesellschaftsrecht", wo: "Prinzenberg Prien & Partner Rechtsanwälte" },
    ],
    politischeStationen: [
      { von: "1981", bis: "heute", was: "Eintritt in die CDU", wo: "CDU" },
      { von: "2011", bis: "2017", was: "Mitglied der Hamburgischen Bürgerschaft (2015-2017 stellv. Fraktionsvorsitzende)", wo: "Hamburg" },
      { von: "2017", bis: "2025", was: "Ministerin für Bildung, Wissenschaft und Kultur", wo: "Schleswig-Holstein" },
      { von: "2022", bis: "heute", was: "Stellvertretende Bundesvorsitzende der CDU", wo: "CDU Deutschland" },
      { von: "2025", bis: "heute", was: "Bundesministerin für Bildung, Familie, Senioren, Frauen und Jugend", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Lebenslauf Karin Prien – BMBFSFJ", url: "https://www.bmbfsfj.bund.de/bmbfsfj/ministerium/ministerin-hausleitung/karin-prien-264380" },
      { label: "Karin Prien – Bundesregierung.de", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/karin-prien-2342644" },
    ],
  },
  {
    name: "Bärbel Bas",
    slug: "baerbel-bas",
    amt: "Bundesministerin für Arbeit und Soziales",
    partei: "SPD",
    geboren: "03.05.1968, Walsum (heute Duisburg)",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1984", bis: "1984", was: "Hauptschulabschluss", wo: "Voerde" },
      { von: "1985", bis: "1987", was: "Ausbildung zur Bürogehilfin", wo: "Duisburg" },
      { von: "1994", bis: "1997", was: "Weiterbildung zur Sozialversicherungsfachangestellten", wo: "" },
      { was: "Weiterbildung zur Betriebswirtin", wo: "" },
    ],
    berufVorPolitik: [
      { von: "1987", bis: "2001", was: "Sachbearbeiterin", wo: "Duisburger Verkehrsgesellschaft (DVG)" },
      { was: "Tätigkeit im Bereich Personalmanagement bei einer Betriebskrankenkasse", wo: "Krankenkasse" },
    ],
    politischeStationen: [
      { von: "1988", bis: "heute", was: "Eintritt in die SPD", wo: "SPD" },
      { von: "1994", bis: "2002", was: "Mitglied im Rat der Stadt Duisburg", wo: "Duisburg" },
      { von: "2009", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "Deutscher Bundestag" },
      { von: "2013", bis: "2019", was: "Parlamentarische Geschäftsführerin der SPD-Bundestagsfraktion", wo: "Deutscher Bundestag" },
      { von: "2019", bis: "2021", was: "Stellvertretende Fraktionsvorsitzende der SPD-Bundestagsfraktion", wo: "Deutscher Bundestag" },
      { von: "2021", bis: "2025", was: "Präsidentin des Deutschen Bundestages", wo: "Deutscher Bundestag" },
      { von: "2025", bis: "heute", was: "Bundesministerin für Arbeit und Soziales", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Lebenslauf Bärbel Bas – BMAS", url: "https://www.bmas.de/DE/Ministerium/Ministerin-und-Hausleitung/baerbel-bas-lebenslauf.html" },
      { label: "Bärbel Bas – Bundesregierung.de", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/baerbel-bas-2342788" },
    ],
  },
  {
    name: "Karsten Wildberger",
    slug: "karsten-wildberger",
    amt: "Bundesminister für Digitales und Staatsmodernisierung",
    partei: "CDU",
    geboren: "05.09.1969, Gießen",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1989", bis: "1995", was: "Studium der Physik", wo: "TU München und RWTH Aachen" },
      { von: "1995", bis: "1997", was: "Promotion in Physik (Dr. rer. nat.)", wo: "RWTH Aachen und Forschungszentrum Jülich" },
      { von: "2000", bis: "2000", was: "MBA", wo: "INSEAD, Fontainebleau (Frankreich)" },
    ],
    berufVorPolitik: [
      { von: "1998", bis: "2003", was: "Unternehmensberater", wo: "The Boston Consulting Group" },
      { von: "2003", bis: "2006", was: "Führungspositionen", wo: "Deutsche Telekom" },
      { von: "2006", bis: "2011", was: "Führungspositionen", wo: "Vodafone (Rumänien und Großbritannien)" },
      { von: "2011", bis: "2012", was: "Unternehmensberater", wo: "The Boston Consulting Group" },
      { von: "2012", bis: "2016", was: "Vorstandsmitglied", wo: "Telstra Group, Melbourne (Australien)" },
      { von: "2016", bis: "2021", was: "Vorstandsmitglied", wo: "E.ON SE" },
      { von: "2021", bis: "2025", was: "Vorstandsvorsitzender (CEO) und Geschäftsführer", wo: "CECONOMY AG / MediaMarktSaturn" },
    ],
    politischeStationen: [
      { von: "05/2025", bis: "heute", was: "Eintritt in die CDU", wo: "CDU" },
      { von: "2025", bis: "heute", was: "Bundesminister für Digitales und Staatsmodernisierung", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Karsten Wildberger – Bundesregierung.de", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/2342876-2342876" },
      { label: "Bundesministerium für Digitales und Staatsmodernisierung (BMDS)", url: "https://bmds.bund.de/de/das-ministerium/leitung/minister" },
    ],
  },
  {
    name: "Patrick Schnieder",
    slug: "patrick-schnieder",
    amt: "Bundesminister für Verkehr",
    partei: "CDU",
    geboren: "01.05.1968, Kyllburg",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1987", bis: "1987", was: "Abitur", wo: "St. Matthias-Gymnasium Gerolstein" },
      { von: "1988", bis: "1995", was: "Studium der Rechtswissenschaft", wo: "Rheinische Friedrich-Wilhelms-Universität Bonn" },
      { von: "1995", bis: "1997", was: "Rechtsreferendariat, Zweites juristisches Staatsexamen", wo: "" },
    ],
    berufVorPolitik: [
      { von: "1998", bis: "1999", was: "Rechtsanwalt", wo: "" },
    ],
    politischeStationen: [
      { von: "1999", bis: "2025", was: "Mitglied im Kreistag (Eifelkreis Bitburg-Prüm)", wo: "Eifelkreis Bitburg-Prüm" },
      { von: "1999", bis: "2009", was: "Bürgermeister der Verbandsgemeinde Arzfeld", wo: "Arzfeld" },
      { von: "2009", bis: "heute", was: "Mitglied des Deutschen Bundestages (Rheinland-Pfalz)", wo: "Deutscher Bundestag" },
      { von: "2011", bis: "2018", was: "Generalsekretär der CDU Rheinland-Pfalz", wo: "CDU Rheinland-Pfalz" },
      { von: "2018", bis: "2025", was: "Parlamentarischer Geschäftsführer der CDU/CSU-Bundestagsfraktion", wo: "Deutscher Bundestag" },
      { von: "2025", bis: "heute", was: "Bundesminister für Verkehr", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Patrick Schnieder – BMV (Bundesministerium für Verkehr)", url: "https://www.bmv.de/SharedDocs/DE/Artikel/K/Ministerium/patrick-schnieder-bundesminister.html" },
      { label: "Patrick Schnieder – Bundesregierung.de", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/patrick-schnieder-2342686" },
    ],
  },
  {
    name: "Carsten Schneider",
    slug: "carsten-schneider",
    amt: "Bundesminister für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit",
    partei: "SPD",
    geboren: "23.01.1976, Erfurt",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "1991", bis: "1994", was: "Abitur", wo: "Erfurt (Johann-Wilhelm-Häßler-Gymnasium)" },
      { von: "1994", bis: "1997", was: "Ausbildung zum Bankkaufmann", wo: "Volksbank Erfurt" },
    ],
    berufVorPolitik: [
      { von: "1997", bis: "1998", was: "Zivildienst", wo: "Erfurt" },
      { von: "1998", bis: "1998", was: "Bankkaufmann", wo: "Sparkasse Erfurt" },
    ],
    politischeStationen: [
      { von: "1995", bis: "heute", was: "Mitglied der SPD", wo: "" },
      { von: "1998", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "" },
      { von: "2005", bis: "2013", was: "Haushaltspolitischer Sprecher der SPD-Bundestagsfraktion", wo: "" },
      { von: "2013", bis: "2017", was: "Stellvertretender Vorsitzender der SPD-Bundestagsfraktion", wo: "" },
      { von: "2014", bis: "2017", was: "Stellvertretender Landesvorsitzender der SPD Thüringen", wo: "" },
      { von: "2017", bis: "2021", was: "Erster Parlamentarischer Geschäftsführer der SPD-Bundestagsfraktion", wo: "" },
      { von: "2021", bis: "2025", was: "Staatsminister und Beauftragter der Bundesregierung für Ostdeutschland", wo: "Bundeskanzleramt" },
      { von: "06.05.2025", bis: "heute", was: "Bundesminister für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit", wo: "" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Carsten Schneider (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/carsten-schneider-2342712" },
      { label: "Deutscher Bundestag – Biografie Carsten Schneider", url: "https://www.bundestag.de/abgeordnete/biografien/S/schneider_carsten-1047194" },
    ],
  },
  {
    name: "Nina Warken",
    slug: "nina-warken",
    amt: "Bundesministerin für Gesundheit",
    partei: "CDU",
    geboren: "15.05.1979, Bad Mergentheim",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "", bis: "1998", was: "Abitur", wo: "Tauberbischofsheim (Matthias-Grünewald-Gymnasium)" },
      { von: "1998", bis: "2002", was: "Studium der Rechtswissenschaft", wo: "Ruprecht-Karls-Universität Heidelberg" },
      { von: "2003", bis: "2003", was: "Erstes juristisches Staatsexamen", wo: "" },
      { von: "2003", bis: "2005", was: "Rechtsreferendariat", wo: "Landgericht Mosbach" },
      { von: "2005", bis: "2005", was: "Zweites juristisches Staatsexamen", wo: "" },
    ],
    berufVorPolitik: [
      { von: "2006", bis: "heute", was: "Rechtsanwältin", wo: "" },
    ],
    politischeStationen: [
      { von: "1999", bis: "heute", was: "Mitglied der CDU", wo: "" },
      { von: "2004", bis: "2024", was: "Mitglied des Gemeinderates Tauberbischofsheim", wo: "" },
      { von: "2006", bis: "2014", was: "Stellvertretende Bundesvorsitzende der Jungen Union Deutschlands", wo: "" },
      { von: "2013", bis: "2017", was: "Mitglied des Deutschen Bundestages", wo: "" },
      { von: "2014", bis: "2019", was: "Mitglied des Kreistages Main-Tauber-Kreis", wo: "" },
      { von: "2015", bis: "2023", was: "Präsidentin der THW-Landeshelfervereinigung Baden-Württemberg", wo: "" },
      { von: "2018", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "" },
      { von: "2021", bis: "2025", was: "Parlamentarische Geschäftsführerin der CDU/CSU-Bundestagsfraktion", wo: "" },
      { von: "2023", bis: "2025", was: "Generalsekretärin der CDU Baden-Württemberg", wo: "" },
      { von: "06.05.2025", bis: "heute", was: "Bundesministerin für Gesundheit", wo: "" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Lebenslauf Nina Warken", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342840" },
      { label: "Bundesregierung.de – Nina Warken (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/nina-warken-2342850" },
      { label: "Deutscher Bundestag – Biografie Nina Warken", url: "https://www.bundestag.de/abgeordnete/biografien/W/warken_nina-1047986" },
    ],
  },
  {
    name: "Alois Rainer",
    slug: "alois-rainer",
    amt: "Bundesminister für Landwirtschaft, Ernährung und Heimat",
    partei: "CSU",
    geboren: "07.01.1965, Straubing",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "", bis: "1980", was: "Hauptschulabschluss", wo: "Haibach" },
      { von: "1980", bis: "1983", was: "Ausbildung zum Metzger", wo: "" },
      { von: "1986", bis: "1986", was: "Meisterprüfung zum Metzgermeister", wo: "" },
    ],
    berufVorPolitik: [
      { von: "1983", bis: "1984", was: "Grundwehrdienst", wo: "" },
      { von: "1987", bis: "heute", was: "Metzgermeister, Übernahme des elterlichen Betriebes", wo: "Haibach" },
    ],
    politischeStationen: [
      { von: "1989", bis: "heute", was: "Mitglied der CSU", wo: "" },
      { von: "1996", bis: "2014", was: "Bürgermeister der Gemeinde Haibach", wo: "" },
      { von: "2002", bis: "heute", was: "Kreisrat des Landkreises Straubing-Bogen", wo: "" },
      { von: "2013", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "" },
      { von: "2018", bis: "2019", was: "Haushalts- und finanzpolitischer Sprecher der CSU-Landesgruppe", wo: "" },
      { von: "2019", bis: "2021", was: "Verkehrspolitischer Sprecher der CDU/CSU-Bundestagsfraktion", wo: "" },
      { von: "2021", bis: "2025", was: "Vorsitzender des Finanzausschusses des Deutschen Bundestages", wo: "" },
      { von: "06.05.2025", bis: "heute", was: "Bundesminister für Landwirtschaft, Ernährung und Heimat", wo: "" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Alois Rainer (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/alois-rainer-2342622" },
      { label: "BMLEH – Minister Alois Rainer", url: "https://www.bmleh.de/DE/ministerium/minister/bm-rainer.html" },
      { label: "Deutscher Bundestag – Biografie Alois Rainer", url: "https://www.bundestag.de/abgeordnete/biografien/R/rainer_alois-1046668" },
    ],
  },
  {
    name: "Reem Alabali-Radovan",
    slug: "reem-alabali-radovan",
    amt: "Bundesministerin für wirtschaftliche Zusammenarbeit und Entwicklung",
    partei: "SPD",
    geboren: "01.05.1990, Moskau",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "", bis: "2008", was: "Abitur", wo: "Schwerin" },
      { von: "2008", bis: "2013", was: "Studium der Politikwissenschaft, Bachelor of Arts", wo: "Freie Universität Berlin" },
    ],
    berufVorPolitik: [
      { von: "2012", bis: "2014", was: "Wissenschaftliche Mitarbeiterin", wo: "Deutsches Orient-Institut, Berlin" },
      { von: "2012", bis: "2014", was: "Assistentin, später Länderreferentin", wo: "Nah- und Mittelost-Verein (NUMOV), Berlin" },
      { von: "2015", bis: "2018", was: "Sachbearbeiterin", wo: "Landesamt für innere Verwaltung Mecklenburg-Vorpommern" },
      { von: "2018", bis: "2020", was: "Leiterin des Büros der Integrationsbeauftragten", wo: "Land Mecklenburg-Vorpommern" },
    ],
    politischeStationen: [
      { von: "2020", bis: "2021", was: "Integrationsbeauftragte der Landesregierung Mecklenburg-Vorpommern", wo: "" },
      { von: "2021", bis: "heute", was: "Mitglied der SPD", wo: "" },
      { von: "2021", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "" },
      { von: "2021", bis: "2025", was: "Staatsministerin bei der Bundeskanzlerin/beim Bundeskanzler, Beauftragte der Bundesregierung für Migration, Flüchtlinge und Integration", wo: "Bundeskanzleramt" },
      { von: "2022", bis: "2025", was: "Beauftragte der Bundesregierung für Antirassismus", wo: "" },
      { von: "06.05.2025", bis: "heute", was: "Bundesministerin für wirtschaftliche Zusammenarbeit und Entwicklung", wo: "" },
    ],
    quellen: [
      { label: "Bundesregierung.de – Lebenslauf Reem Alabali Radovan", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342824" },
      { label: "Bundesregierung.de – Reem Alabali Radovan (Bundeskabinett)", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/reem-alabali-radovan-2342836" },
      { label: "BMZ – Leitung: Reem Alabali Radovan", url: "https://www.bmz.de/de/ministerium/leitung/reem-alabali-radovan-250966" },
    ],
  },
  {
    name: "Verena Hubertz",
    slug: "verena-hubertz",
    amt: "Bundesministerin für Wohnen, Stadtentwicklung und Bauwesen",
    partei: "SPD",
    geboren: "26.11.1987, Trier",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "", bis: "2007", was: "Abitur", wo: "Konz" },
      { von: "2007", bis: "2013", was: "Studium der Betriebswirtschaftslehre (Bachelor an der Hochschule Trier, Master of Science an der WHU – Otto Beisheim School of Management)", wo: "Hochschule Trier / WHU – Otto Beisheim School of Management, Vallendar" },
    ],
    berufVorPolitik: [
      { von: "2013", bis: "2020", was: "Gründerin und Geschäftsführerin des Start-ups Kitchen Stories (videobasierte Kochplattform)", wo: "Berlin" },
    ],
    politischeStationen: [
      { von: "2010", bis: "heute", was: "Mitglied der SPD", wo: "" },
      { von: "2021", bis: "heute", was: "Mitglied des Deutschen Bundestages (Rheinland-Pfalz)", wo: "Deutscher Bundestag" },
      { von: "2021", bis: "2025", was: "Stellvertretende Vorsitzende der SPD-Bundestagsfraktion", wo: "Deutscher Bundestag" },
      { von: "05/2025", bis: "heute", was: "Bundesministerin für Wohnen, Stadtentwicklung und Bauwesen", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Bundesregierung – Lebenslauf Verena Hubertz", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342744" },
      { label: "Bundesregierung – Verena Hubertz: Bauministerin", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/verena-hubertz-2342756" },
      { label: "Deutscher Bundestag – Biografie Verena Hubertz", url: "https://www.bundestag.de/webarchiv/abgeordnete/biografien20/H/hubertz_verena-861188" },
    ],
  },
  {
    name: "Thorsten Frei",
    slug: "thorsten-frei",
    amt: "Bundesminister für besondere Aufgaben und Chef des Bundeskanzleramts",
    partei: "CDU",
    geboren: "08.08.1973, Bad Säckingen",
    imAmtSeit: "06.05.2025",
    ausbildung: [
      { von: "", bis: "1993", was: "Abitur", wo: "Bad Säckingen" },
      { von: "1993", bis: "1994", was: "Wehrdienst bei der Deutsch-Französischen Brigade", wo: "" },
      { von: "1994", bis: "1999", was: "Studium der Rechtswissenschaften, Erstes juristisches Staatsexamen (1999)", wo: "Universität Freiburg" },
      { von: "1999", bis: "2001", was: "Juristisches Referendariat, Zweites juristisches Staatsexamen (2001)", wo: "Landgericht Waldshut-Tiengen" },
    ],
    berufVorPolitik: [
      { von: "2001", bis: "2002", was: "Rechtsanwalt", wo: "" },
      { von: "2002", bis: "2004", was: "Regierungsrat im Staatsministerium Baden-Württemberg und persönlicher Referent des Staats- und Europaministers", wo: "Staatsministerium Baden-Württemberg" },
    ],
    politischeStationen: [
      { von: "2004", bis: "2013", was: "Oberbürgermeister der Stadt Donaueschingen", wo: "Donaueschingen" },
      { von: "2007", bis: "heute", was: "Stellvertretender Landesvorsitzender der CDU Baden-Württemberg", wo: "CDU Baden-Württemberg" },
      { von: "2013", bis: "heute", was: "Mitglied des Deutschen Bundestages", wo: "Deutscher Bundestag" },
      { von: "2018", bis: "2021", was: "Stellvertretender Vorsitzender der CDU/CSU-Bundestagsfraktion", wo: "Deutscher Bundestag" },
      { von: "2021", bis: "2025", was: "Erster Parlamentarischer Geschäftsführer der CDU/CSU-Bundestagsfraktion", wo: "Deutscher Bundestag" },
      { von: "05/2025", bis: "heute", was: "Bundesminister für besondere Aufgaben und Chef des Bundeskanzleramts", wo: "Bundesregierung" },
    ],
    quellen: [
      { label: "Bundesregierung – Lebenslauf Thorsten Frei", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/lebenslauf-2342760" },
      { label: "Bundesregierung – Thorsten Frei: Chef des Bundeskanzleramts", url: "https://www.bundesregierung.de/breg-de/bundesregierung/bundeskabinett/thorsten-frei-2342770" },
    ],
  },
];
