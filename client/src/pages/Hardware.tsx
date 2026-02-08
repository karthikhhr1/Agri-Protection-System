import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cpu,
  Camera,
  Droplets,
  Thermometer,
  Plus,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Activity,
  Zap,
  Radio,
  Image,
  Eye,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { HardwareDevice } from "@shared/schema";

interface DiscoveredDevice {
  ip: string;
  type: "soil_sensor" | "camera" | "weather_station" | "water_meter";
  name: string;
  protocol: "wifi" | "lora" | "zigbee" | "wired" | "bluetooth";
  status: string;
}

export default function Hardware() {
  const { t, formatTime } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [newDevice, setNewDevice] = useState({
    name: "",
    type: "soil_sensor" as "soil_sensor" | "camera" | "weather_station" | "water_meter",
    connectionType: "wifi" as "wifi" | "lora" | "zigbee" | "wired" | "bluetooth",
    connectionUrl: "",
    model: "Auto-detected",
  });

  const { data: devices = [], isLoading } = useQuery<HardwareDevice[]>({
    queryKey: ["/api/devices"],
  });

  const scanForDevices = async () => {
    setIsScanning(true);
    try {
      const response = await fetch("/api/devices/discover");
      const data = await response.json();
      setDiscoveredDevices(data.discovered || []);
      toast({ 
        title: data.message,
        description: data.alreadyConnected > 0 ? `${data.alreadyConnected} device(s) already connected` : undefined
      });
    } catch (error) {
      toast({ title: t('hardware.scanFailed'), variant: "destructive" });
    }
    setIsScanning(false);
  };

  const quickConnect = useMutation({
    mutationFn: async (device: DiscoveredDevice) => {
      const response = await fetch("/api/devices/quick-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(device),
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setDiscoveredDevices(prev => prev.filter(d => d.ip !== data.connectionUrl?.split("//")[1]?.split(":")[0]?.split("/")[0]));
      toast({ 
        title: t('hardware.deviceConnected'),
        description: `${data.name} is now online`
      });
    },
    onError: () => {
      toast({ title: t('hardware.connectionFailed'), variant: "destructive" });
    }
  });

  const addDevice = useMutation({
    mutationFn: async (data: typeof newDevice) => {
      const res = await apiRequest("POST", "/api/devices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setIsAddOpen(false);
      setNewDevice({ name: "", type: "soil_sensor", connectionType: "wifi", connectionUrl: "", model: "Auto-detected" });
      toast({ title: t('hardware.deviceAdded'), description: t('hardware.deviceAddedDesc') });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('hardware.addFailed'), variant: "destructive" });
    }
  });

  const deleteDevice = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ title: t('hardware.deviceRemoved') });
    }
  });

  const testConnection = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/devices/${id}/test`);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({ 
        title: t('hardware.connectionSuccess'), 
        description: `${t('hardware.latency')}: ${data.latency}ms`
      });
    },
    onError: () => {
      toast({ title: t('hardware.connectionFailed'), variant: "destructive" });
    }
  });

  const captureImage = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/devices/${id}/capture`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({ 
        title: t('hardware.imageCaptured'), 
        description: t('hardware.imageCapturedDesc')
      });
    },
    onError: () => {
      toast({ title: t('hardware.captureFailed'), variant: "destructive" });
    }
  });

  const readSensor = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/devices/${id}/read`);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/irrigation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/irrigation/settings"] });
      toast({
        title: t('hardware.sensorRead'),
        description: `${t('irrigation.soilMoisture')}: ${data.soilMoisture}%, ${t('irrigation.humidity')}: ${data.humidity}%`
      });
    },
    onError: () => {
      toast({ title: t('hardware.readFailed'), variant: "destructive" });
    }
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'camera': return Camera;
      case 'soil_sensor': return Droplets;
      case 'weather_station': return Thermometer;
      case 'water_meter': return Activity;
      default: return Cpu;
    }
  };

  const getDeviceTypeName = (type: string) => {
    switch (type) {
      case 'camera': return t('hardware.camera');
      case 'soil_sensor': return t('hardware.soilSensor');
      case 'weather_station': return t('hardware.weatherStation');
      case 'water_meter': return t('hardware.waterMeter');
      default: return type;
    }
  };

  const sensors = devices.filter(d => d.type === 'soil_sensor' || d.type === 'weather_station' || d.type === 'water_meter');
  const cameras = devices.filter(d => d.type === 'camera');

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-background/50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Cpu className="w-8 h-8" />
            {t('hardware.pageTitle')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">{t('hardware.pageSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={scanForDevices}
            disabled={isScanning}
            data-testid="button-scan-devices"
            className="gap-2"
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Radio className="w-4 h-4" />
            )}
            {isScanning ? t('hardware.scanning') : t('hardware.scanDevices')}
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-device" className="gap-2">
                <Plus className="w-4 h-4" />
                {t('hardware.addDevice')}
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md overflow-visible">
            <DialogHeader>
              <DialogTitle>{t('hardware.addNewDevice')}</DialogTitle>
              <DialogDescription>{t('hardware.addDeviceDesc')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('hardware.deviceName')}</Label>
                  <Input
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    placeholder={t('hardware.deviceNamePlaceholder')}
                    data-testid="input-device-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('hardware.deviceType')}</Label>
                  <Select
                    value={newDevice.type}
                    onValueChange={(v: any) => setNewDevice({ ...newDevice, type: v })}
                  >
                    <SelectTrigger data-testid="select-device-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[9999] bg-background border shadow-lg">
                      <SelectItem value="soil_sensor">{t('hardware.soilSensor')}</SelectItem>
                      <SelectItem value="camera">{t('hardware.camera')}</SelectItem>
                      <SelectItem value="weather_station">{t('hardware.weatherStation')}</SelectItem>
                      <SelectItem value="water_meter">{t('hardware.waterMeter')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('hardware.connectionUrl')}</Label>
                <Input
                  value={newDevice.connectionUrl}
                  onChange={(e) => setNewDevice({ ...newDevice, connectionUrl: e.target.value })}
                  placeholder={newDevice.type === 'camera' ? "rtsp://192.168.1.100:554/stream" : "http://192.168.1.100/api"}
                  data-testid="input-connection-url"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={() => addDevice.mutate(newDevice)}
                disabled={!newDevice.name || addDevice.isPending}
                data-testid="button-save-device"
              >
                {addDevice.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatusCard
          title={t('hardware.totalDevices')}
          value={devices.length}
          icon={Cpu}
          color="primary"
        />
        <StatusCard
          title={t('hardware.sensorsConnected')}
          value={sensors.length}
          icon={Droplets}
          color="blue"
        />
        <StatusCard
          title={t('hardware.camerasConnected')}
          value={cameras.length}
          icon={Camera}
          color="green"
        />
        <StatusCard
          title={t('hardware.online')}
          value={devices.filter(d => d.status === 'online').length}
          icon={Wifi}
          color={devices.filter(d => d.status === 'online').length > 0 ? "green" : "gray"}
        />
      </div>

      {discoveredDevices.length > 0 && (
        <Card className="shadow-lg border-2 border-dashed border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary animate-pulse" />
              {t('hardware.discoveredDevices')}
            </CardTitle>
            <CardDescription>{t('hardware.discoveredDevicesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {discoveredDevices.map((device) => {
                const Icon = getDeviceIcon(device.type);
                return (
                  <motion.div
                    key={device.ip}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.ip}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => quickConnect.mutate(device)}
                      disabled={quickConnect.isPending}
                      data-testid={`button-connect-${device.ip}`}
                    >
                      {quickConnect.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {t('hardware.connect')}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              {t('hardware.sensors')}
            </CardTitle>
            <CardDescription>{t('hardware.sensorsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : sensors.length === 0 ? (
              <div className="py-8 text-center">
                <Droplets className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t('hardware.noSensors')}</p>
                <p className="text-sm text-muted-foreground/70 mt-1">{t('hardware.addSensorPrompt')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {sensors.map((device, index) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      index={index}
                      onTest={() => testConnection.mutate(device.id)}
                      onRead={() => readSensor.mutate(device.id)}
                      onDelete={() => deleteDevice.mutate(device.id)}
                      isTestPending={testConnection.isPending}
                      isReadPending={readSensor.isPending}
                      t={t}
                      formatTime={formatTime}
                      getDeviceTypeName={getDeviceTypeName}
                      getDeviceIcon={getDeviceIcon}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-green-500" />
              {t('hardware.cameras')}
            </CardTitle>
            <CardDescription>{t('hardware.camerasDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : cameras.length === 0 ? (
              <div className="py-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t('hardware.noCameras')}</p>
                <p className="text-sm text-muted-foreground/70 mt-1">{t('hardware.addCameraPrompt')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {cameras.map((device, index) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      index={index}
                      onTest={() => testConnection.mutate(device.id)}
                      onCapture={() => captureImage.mutate(device.id)}
                      onDelete={() => deleteDevice.mutate(device.id)}
                      isTestPending={testConnection.isPending}
                      isCapturePending={captureImage.isPending}
                      t={t}
                      formatTime={formatTime}
                      getDeviceTypeName={getDeviceTypeName}
                      getDeviceIcon={getDeviceIcon}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg bg-primary/5 border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{t('hardware.howToConnect')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('hardware.howToConnectDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    gray: "bg-muted text-muted-foreground border-muted",
    primary: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <Card className={cn("shadow-md border", colorClasses[color] || colorClasses.primary)}>
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-medium truncate">{title}</span>
        </div>
        <p className="text-xl md:text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DeviceCard({ 
  device, 
  index, 
  onTest, 
  onDelete, 
  onRead, 
  onCapture, 
  isTestPending, 
  isReadPending, 
  isCapturePending,
  t, 
  formatTime,
  getDeviceTypeName,
  getDeviceIcon
}: any) {
  const Icon = getDeviceIcon(device.type);
  const isOnline = device.status === 'online';
  const isCamera = device.type === 'camera';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all",
        isOnline ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-muted"
      )}
      data-testid={`device-card-${device.id}`}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isOnline ? "bg-green-500/20" : "bg-muted"
        )}>
          <Icon className={cn("w-5 h-5", isOnline ? "text-green-600" : "text-muted-foreground")} />
        </div>
        <div>
          <p className="font-semibold text-foreground">{device.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <Badge variant="secondary" className="text-xs">
              {getDeviceTypeName(device.type)}
            </Badge>
            {device.connectionType && (
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3" />
                {device.connectionType.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge 
          variant={isOnline ? "default" : "secondary"}
          className={isOnline ? "bg-green-500" : ""}
        >
          {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
          {isOnline ? t('hardware.online') : t('hardware.offline')}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={onTest}
          disabled={isTestPending}
          data-testid={`button-test-${device.id}`}
        >
          <RefreshCw className={cn("w-3 h-3 mr-1", isTestPending && "animate-spin")} />
          {t('hardware.test')}
        </Button>
        {isCamera ? (
          <Button
            size="sm"
            variant="default"
            onClick={onCapture}
            disabled={isCapturePending}
            data-testid={`button-capture-${device.id}`}
          >
            <Image className="w-3 h-3 mr-1" />
            {t('hardware.capture')}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={onRead}
            disabled={isReadPending}
            data-testid={`button-read-${device.id}`}
          >
            <Eye className="w-3 h-3 mr-1" />
            {t('hardware.read')}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
          data-testid={`button-delete-${device.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
