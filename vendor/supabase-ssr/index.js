const { createClient } = require("@supabase/supabase-js");

const createBrowserClient = (supabaseUrl, supabaseKey, options) =>
  createClient(supabaseUrl, supabaseKey, options);

const createServerClient = (supabaseUrl, supabaseKey, options) =>
  createClient(supabaseUrl, supabaseKey, options);

module.exports = {
  createBrowserClient,
  createServerClient,
};
