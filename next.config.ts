import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Τα αρχεία του content/ διαβάζονται στο runtime από τη σελίδα αναζήτησης
  // και από τυχόν δυναμικά κεφάλαια, οπότε πρέπει να μπουν στο server trace.
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
};

export default nextConfig;
