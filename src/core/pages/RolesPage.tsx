import { useTranslation } from 'react-i18next';
import { useGetRoles, type Role } from '../api/role';
import { Shield, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RolesPage() {
  const { t } = useTranslation();
  const { data: dataRaw, isLoading } = useGetRoles({});

  const roles: Role[] = Array.isArray(dataRaw) ? dataRaw : dataRaw?.results || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 bg-white dark:bg-card">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('navigation.roles')}</h1>
          <p className="text-gray-500">{t('common.total')}: {roles.length}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="bg-white dark:bg-card shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-5 w-5 ${role.is_admin ? 'text-amber-500' : 'text-primary'}`} />
                    <CardTitle className="text-lg font-semibold">{role.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {role.is_system && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                        {t('common.system')}
                      </span>
                    )}
                    {role.is_admin && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {t('common.admin')}
                      </span>
                    )}
                    {role.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-mono">{role.code}</span>
                  </div>
                  {role.permissions && Object.keys(role.permissions).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{t('common.permissions')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.permissions).map(([key, val]) =>
                          val ? (
                            <span key={key} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                              {key}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
