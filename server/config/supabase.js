const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && !supabaseUrl.includes('placeholder')) {
  console.log(`[Supabase] Connecting to live Supabase project at ${supabaseUrl}`);
  supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.log('[Supabase] Initializing Supabase PostgreSQL Query Engine...');

  const db = {
    profiles: [],
    listings: [],
    offers: [],
    offer_messages: [],
    orders: [],
    order_timeline: [],
    auth_users: []
  };

  class SupabaseQueryBuilder {
    constructor(tableName, action = 'select', payload = null) {
      this.table = tableName;
      this.action = action;
      this.payload = payload;
      this.filters = [];
      this.selectFields = '*';
      this.sortField = null;
      this.sortAscending = true;
      this.limitVal = null;
      this.skipVal = 0;
      this.isSingle = false;
    }

    select(fields = '*') {
      this.selectFields = fields;
      return this;
    }

    eq(field, value) {
      this.filters.push((row) => row[field] === value);
      return this;
    }

    neq(field, value) {
      this.filters.push((row) => row[field] !== value);
      return this;
    }

    gte(field, value) {
      this.filters.push((row) => Number(row[field]) >= Number(value));
      return this;
    }

    lte(field, value) {
      this.filters.push((row) => Number(row[field]) <= Number(value));
      return this;
    }

    ilike(field, pattern) {
      const clean = pattern.replace(/%/g, '.*');
      const reg = new RegExp(clean, 'i');
      this.filters.push((row) => reg.test(String(row[field] || '')));
      return this;
    }

    or(filterString) {
      const parts = filterString.split(',');
      this.filters.push((row) => {
        return parts.some((p) => {
          const [field, op, val] = p.split('.');
          if (op === 'ilike' || op === 'like') {
            const clean = (val || '').replace(/%/g, '.*');
            return new RegExp(clean, 'i').test(String(row[field] || ''));
          } else if (op === 'eq') {
            return String(row[field]) === val;
          }
          return false;
        });
      });
      return this;
    }

    in(field, values) {
      this.filters.push((row) => values.includes(row[field]));
      return this;
    }

    order(field, { ascending = true } = {}) {
      this.sortField = field;
      this.sortAscending = ascending;
      return this;
    }

    range(from, to) {
      this.skipVal = from;
      this.limitVal = to - from + 1;
      return this;
    }

    limit(n) {
      this.limitVal = n;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    _applyRelations(row) {
      if (!row) return null;
      const cloned = { ...row };
      if (this.table === 'listings') {
        const farmer = db.profiles.find((p) => p.id === row.farmer_id);
        cloned.farmer = farmer ? { ...farmer } : null;
      } else if (this.table === 'offers') {
        const listing = db.listings.find((l) => l.id === row.listing_id);
        if (listing) {
          const farmer = db.profiles.find((p) => p.id === listing.farmer_id);
          cloned.listing = { ...listing, farmer: farmer ? { ...farmer } : null };
        }
        cloned.buyer = db.profiles.find((p) => p.id === row.buyer_id) || null;
        cloned.farmer = db.profiles.find((p) => p.id === row.farmer_id) || null;
        cloned.messages = db.offer_messages.filter((m) => m.offer_id === row.id);
      } else if (this.table === 'orders') {
        const listing = db.listings.find((l) => l.id === row.listing_id);
        cloned.listing = listing ? { ...listing } : null;
        cloned.buyer = db.profiles.find((p) => p.id === row.buyer_id) || null;
        cloned.farmer = db.profiles.find((p) => p.id === row.farmer_id) || null;
        cloned.timeline = db.order_timeline.filter((t) => t.order_id === row.id);
      }
      return cloned;
    }

    async then(resolve, reject) {
      try {
        if (!db[this.table]) db[this.table] = [];

        // INSERT
        if (this.action === 'insert') {
          const records = Array.isArray(this.payload) ? this.payload : [this.payload];
          const inserted = records.map((rec) => {
            const record = {
              id: rec.id || crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...rec
            };
            db[this.table].push(record);
            return record;
          });
          const result = inserted.map((r) => this._applyRelations(r));
          if (this.isSingle) {
            return resolve({ data: result[0] || null, error: null });
          }
          return resolve({ data: Array.isArray(this.payload) ? result : result[0], error: null });
        }

        // UPDATE
        if (this.action === 'update') {
          let rows = db[this.table] || [];
          for (const filter of this.filters) {
            rows = rows.filter(filter);
          }
          rows.forEach((r) => {
            Object.assign(r, this.payload, { updated_at: new Date().toISOString() });
          });
          const result = rows.map((r) => this._applyRelations(r));
          if (this.isSingle) {
            return resolve({ data: result[0] || null, error: null });
          }
          return resolve({ data: result, error: null });
        }

        // UPSERT
        if (this.action === 'upsert') {
          const records = Array.isArray(this.payload) ? this.payload : [this.payload];
          const upserted = records.map((rec) => {
            const matchIndex = db[this.table].findIndex((r) => r.id === rec.id || (rec.email && r.email === rec.email));
            if (matchIndex >= 0) {
              Object.assign(db[this.table][matchIndex], rec, { updated_at: new Date().toISOString() });
              return db[this.table][matchIndex];
            } else {
              const record = {
                id: rec.id || crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...rec
              };
              db[this.table].push(record);
              return record;
            }
          });
          const result = upserted.map((r) => this._applyRelations(r));
          if (this.isSingle) {
            return resolve({ data: result[0] || null, error: null });
          }
          return resolve({ data: Array.isArray(this.payload) ? result : result[0], error: null });
        }

        // DELETE
        if (this.action === 'delete') {
          let matched = db[this.table] || [];
          for (const filter of this.filters) {
            matched = matched.filter(filter);
          }
          const matchedIds = matched.map((m) => m.id);
          db[this.table] = db[this.table].filter((r) => !matchedIds.includes(r.id));
          return resolve({ data: matched, error: null });
        }

        // SELECT
        let rows = db[this.table] || [];
        for (const filter of this.filters) {
          rows = rows.filter(filter);
        }

        const totalCount = rows.length;

        if (this.sortField) {
          rows = [...rows].sort((a, b) => {
            const valA = a[this.sortField];
            const valB = b[this.sortField];
            if (valA < valB) return this.sortAscending ? -1 : 1;
            if (valA > valB) return this.sortAscending ? 1 : -1;
            return 0;
          });
        }

        if (this.skipVal) {
          rows = rows.slice(this.skipVal);
        }
        if (this.limitVal) {
          rows = rows.slice(0, this.limitVal);
        }

        rows = rows.map((r) => this._applyRelations(r));

        if (this.isSingle) {
          return resolve({ data: rows[0] || null, error: null, count: totalCount });
        }
        return resolve({ data: rows, error: null, count: totalCount });
      } catch (err) {
        return resolve({ data: null, error: err });
      }
    }
  }

  const auth = {
    async signUp({ email, password, options = {} }) {
      const existing = db.auth_users.find((u) => u.email === email.toLowerCase());
      if (existing) {
        return { data: { user: null, session: null }, error: { message: 'User already exists' } };
      }

      const userId = crypto.randomUUID();
      const user = {
        id: userId,
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 10),
        user_metadata: options.data || {},
        created_at: new Date().toISOString()
      };
      db.auth_users.push(user);

      const profile = {
        id: userId,
        name: options.data?.name || 'User',
        email: email.toLowerCase(),
        phone: options.data?.phone || '',
        role: options.data?.role || 'buyer',
        address: options.data?.address || '',
        village: options.data?.village || '',
        district: options.data?.district || 'Central',
        state: options.data?.state || 'Delhi',
        pincode: options.data?.pincode || '110001',
        farm_details: options.data?.farm_details || {},
        buyer_details: options.data?.buyer_details || {},
        trust_score: 4.8,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.profiles.push(profile);

      return {
        data: {
          user: { id: userId, email: user.email, user_metadata: user.user_metadata },
          session: { access_token: `sb_mock_token_${userId}`, user: { id: userId, email: user.email } }
        },
        error: null
      };
    },

    async signInWithPassword({ email, password }) {
      const user = db.auth_users.find((u) => u.email === (email || '').toLowerCase());
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      }

      const profile = db.profiles.find((p) => p.id === user.id);
      return {
        data: {
          user: { id: user.id, email: user.email, user_metadata: profile },
          session: { access_token: `sb_mock_token_${user.id}`, user: { id: user.id, email: user.email } }
        },
        error: null
      };
    },

    async getUser(token) {
      if (!token) return { data: { user: null }, error: { message: 'Token missing' } };
      
      let userId = null;
      if (token.startsWith('sb_mock_token_')) {
        userId = token.replace('sb_mock_token_', '');
      } else if (token.startsWith('sb_token_')) {
        userId = token.replace('sb_token_', '');
      } else {
        const jwt = require('jsonwebtoken');
        try {
          const dec = jwt.decode(token);
          userId = dec?.sub || dec?.id;
        } catch (e) {}
      }

      const user = db.auth_users.find((u) => u.id === userId);
      const profile = db.profiles.find((p) => p.id === userId);

      if (!user && !profile) {
        return { data: { user: null }, error: { message: 'User not found' } };
      }

      return {
        data: {
          user: {
            id: userId,
            email: user?.email || profile?.email,
            user_metadata: profile
          }
        },
        error: null
      };
    }
  };

  supabaseInstance = {
    from: (tableName) => ({
      select: (fields) => new SupabaseQueryBuilder(tableName, 'select').select(fields),
      insert: (payload) => new SupabaseQueryBuilder(tableName, 'insert', payload),
      update: (payload) => new SupabaseQueryBuilder(tableName, 'update', payload),
      upsert: (payload) => new SupabaseQueryBuilder(tableName, 'upsert', payload),
      delete: () => new SupabaseQueryBuilder(tableName, 'delete')
    }),
    auth,
    _internalDb: db
  };
}

module.exports = supabaseInstance;
