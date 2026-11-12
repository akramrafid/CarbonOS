import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  ChevronRight,
  TrendingDown,
  Trees,
  Flame
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function AlertsPanel(props) {
  const {
    isLight,
    isBn,
    t,
    activeAlerts = [],
    handleResolveAlert,
    setActiveTab,
    setMapCenter,
    setMapZoom,
    loadingAlerts = false
  } = props;

  return (
    <div className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}>
          <h2 className={`text-2xl font-bold font-sans mb-6 flex items-center space-x-2 ${
            isLight ? 'text-fg-primary' : 'text-white'
          }`}>
            <AlertTriangle className="text-amber" size={24} />
            <span>Canopy Anomaly Alert Board</span>
          </h2>

          {loadingAlerts ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className={`h-20 rounded-xl animate-pulse ${isLight ? 'bg-bg-muted' : 'bg-white/5'}`}></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${
                      alert.is_resolved 
                        ? (isLight ? 'border-border-subtle bg-bg-canvas opacity-75' : 'border-white/10 bg-white/5 opacity-60')
                        : alert.severity === 'critical'
                          ? (isLight ? 'border-red-200 bg-red-50' : 'border-red-500/25 bg-red-500/5')
                          : (isLight ? 'border-amber-200 bg-amber-50' : 'border-amber/25 bg-amber/5')
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            alert.is_resolved
                              ? (isLight ? 'bg-bg-muted text-fg-secondary' : 'bg-white/10 text-white')
                              : alert.severity === 'critical'
                                ? 'bg-red-500/20 text-red-500 font-bold'
                                : 'bg-amber/20 text-amber font-bold'
                          }`}>
                            {alert.severity}
                          </span>
                          
                          <span className={`text-xs font-mono ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                            {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isLight ? 'bg-accent-muted text-accent' : 'bg-emerald/10 text-emerald'
                          }`}>
                            Lat: {alert.location[0].toFixed(4)}, Lng: {alert.location[1].toFixed(4)}
                          </span>
                        </div>
                        
                        <h4 className={`font-bold text-sm flex items-center gap-2 ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                          {alert.alert_type === 'rapid_decline' ? (
                            <>
                              <Trees size={16} className={isLight ? 'text-accent' : 'text-emerald'} />
                              <span>Rapid Vegetation Loss Anomaly</span>
                            </>
                          ) : (
                            <>
                              <Flame size={16} className="text-red-500" />
                              <span>Fire Risk Threat Detected</span>
                            </>
                          )}
                        </h4>
                        
                        <p className={`text-xs ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>{alert.message}</p>
                        
                        <div className={`border rounded-xl p-3 text-xs mt-2 ${
                          isLight ? 'bg-white border-border-subtle' : 'bg-white/5 border-white/5'
                        }`}>
                          <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>Suggested Preventive Action:</span>
                          <span className={`block mt-0.5 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>{alert.suggested_action}</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {alert.is_resolved ? (
                          <span className="text-xs text-emerald font-bold flex items-center space-x-1">
                            <CheckCircle size={14} />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                            className="font-bold text-xs"
                          >
                            Resolve Alert
                          </Button>
                        )}
                        
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setMapCenter(alert.location);
                            setMapZoom(14);
                            if (typeof setMapBounds === 'function') {
                              setMapBounds([
                                [alert.location[0] - 0.01, alert.location[1] - 0.01], 
                                [alert.location[0] + 0.01, alert.location[1] + 0.01]
                              ]);
                            }
                            setActiveTab('map');
                          }}
                          className="font-bold text-xs"
                        >
                          Show on Map
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 border border-dashed rounded-2xl ${
                  isLight ? 'border-border-subtle text-fg-secondary' : 'border-white/10 text-mist'
                }`}>
                  No canopy anomalies detected. Forests are displaying robust photosynthetic activity.
                </div>
              )}
            </div>
          )}
        </div>
  );
}

export default AlertsPanel;
