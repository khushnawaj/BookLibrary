import { ModeToggle } from '@/components/theme/ModeToggle';
import { PaletteSelector } from '@/components/theme/PaletteSelector';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/features/theme/themeHooks';
import { THEME_MODES } from '@/constants/themes';

export default function SettingsPage() {
  const { mode, isDark } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="secondary" className="mb-3">
          Settings
        </Badge>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">Customize your BookVerse experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose a color palette and switch between dark and light mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Color Mode</p>
              <p className="text-sm text-muted-foreground">
                Currently using {isDark ? 'dark' : 'light'} mode.
              </p>
            </div>
            <ModeToggle showLabel />
          </div>

          <div className="flex gap-2">
            {[THEME_MODES.DARK, THEME_MODES.LIGHT].map((m) => (
              <Badge
                key={m}
                variant={mode === m ? 'default' : 'outline'}
                className="cursor-default capitalize"
              >
                {m}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
