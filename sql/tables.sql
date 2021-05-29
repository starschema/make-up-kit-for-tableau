create table font_scan_log(
    id serial PRIMARY KEY ,
    created_at timestamp,


    site_name text,
    workbook_name text,

    fonts_used jsonb,
    workbook_metadata jsonb
);


create table font_metadata(
  font_name text PRIMARY KEY,

  css_for_font text,
  is_installed bool
);


create table scrollbar_themes(
  id serial PRIMARY KEY,

  test_regexp text,
  weight integer,

  color text,
  background_color text,

  radius float,
  width float,
  inset float
);
