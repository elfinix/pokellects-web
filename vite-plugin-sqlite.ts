import type { Plugin, ViteDevServer } from 'vite';
import { IncomingMessage, ServerResponse } from 'node:http';
import { getLocalSqliteDb, seedDatabase } from './server/sqliteDbServer.ts';


function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function viteSqlitePlugin(): Plugin {
  return {
    name: 'vite-plugin-sqlite-local-file',
    configureServer(server: ViteDevServer) {
      // Ensure database is initialized immediately on dev server boot
      try {
        getLocalSqliteDb();
      } catch (err) {
        console.error('Failed to initialize local SQLite database:', err);
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/sqlite/')) {
          return next();
        }

        try {
          const db = getLocalSqliteDb();

          if (req.method === 'POST' && req.url === '/api/sqlite/init') {
            return sendJson(res, 200, { ok: true, message: 'SQLite database ready on local disk (data/pokellects.db)' });
          }

          if (req.method === 'POST' && req.url === '/api/sqlite/query') {
            const { sql, params = [] } = await parseJsonBody(req);
            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            return sendJson(res, 200, { ok: true, rows });
          }

          if (req.method === 'POST' && req.url === '/api/sqlite/query-one') {
            const { sql, params = [] } = await parseJsonBody(req);
            const stmt = db.prepare(sql);
            const row = stmt.get(...params);
            return sendJson(res, 200, { ok: true, row: row ?? null });
          }

          if (req.method === 'POST' && req.url === '/api/sqlite/exec') {
            const { sql, params = [] } = await parseJsonBody(req);
            if (params && params.length > 0) {
              const stmt = db.prepare(sql);
              const info = stmt.run(...params);
              return sendJson(res, 200, { ok: true, changes: info.changes, lastInsertRowid: Number(info.lastInsertRowid) });
            } else {
              db.exec(sql);
              return sendJson(res, 200, { ok: true });
            }
          }

          if (req.method === 'POST' && req.url === '/api/sqlite/reset') {
            seedDatabase(db);
            return sendJson(res, 200, { ok: true, message: 'SQLite database reset and re-seeded' });
          }

          return sendJson(res, 404, { ok: false, error: 'Endpoint not found' });
        } catch (err: any) {
          console.error('SQLite server error:', err);
          return sendJson(res, 500, { ok: false, error: err.message || 'Internal database error' });
        }
      });
    },
  };
}
