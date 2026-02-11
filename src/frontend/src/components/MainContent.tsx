import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import IncidentForm from './IncidentForm';
import IncidentHistory from './IncidentHistory';
import StalkerRecord from './StalkerRecord';
import VictimProfile from './VictimProfile';
import PoliceSubmissionHistory from './PoliceSubmissionHistory';
import CrimeHelp from './CrimeHelp';
import InstallationGuide from './InstallationGuide';
import DVJournalSection from './DVJournalSection';
import ImmediateHelpSafetyPlan from './ImmediateHelpSafetyPlan';
import type { PoliceDepartment } from '../types';

export default function MainContent() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [policeDepartment, setPoliceDepartment] = useState<PoliceDepartment | null>(null);
  const [activeTab, setActiveTab] = useState<string>('victim');

  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleIncidentCreated = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
  };

  const handleReportMenuSelect = (value: string) => {
    setActiveTab(value);
  };

  const handleDVMenuSelect = (value: string) => {
    setActiveTab(value);
  };

  const handleNavigateToImmediateHelp = () => {
    setActiveTab('immediate-help');
  };

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Welcome message - only for authenticated users */}
      {identity && userProfile && (
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
            Welcome back, {userProfile.name}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Your safety, your evidence, your power.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap w-full mb-6 sm:mb-8 gap-0.5 sm:gap-1 h-auto p-1">
          <TabsTrigger
            value="victim"
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight flex-1 min-w-[70px]"
          >
            Your Info
          </TabsTrigger>
          <TabsTrigger
            value="stalker"
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight flex-1 min-w-[70px]"
          >
            Stalker Info
          </TabsTrigger>

          {/* Consolidated Report! Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] xs:text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 leading-tight flex-1 min-w-[70px] ${
                  activeTab === 'report' || activeTab === 'history' || activeTab === 'evidence'
                    ? 'bg-background text-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Report!
                <ChevronDown className="ml-1 h-3 w-3 xs:h-3.5 xs:w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={() => handleReportMenuSelect('report')}>New Report</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleReportMenuSelect('history')}>Report History</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleReportMenuSelect('evidence')}>
                Police Submissions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* DV Journal Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 text-[10px] xs:text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 leading-tight flex-1 min-w-[70px] ${
                  activeTab === 'dv-journal' || activeTab === 'immediate-help'
                    ? 'bg-background text-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                DV Journal
                <ChevronDown className="ml-1 h-3 w-3 xs:h-3.5 xs:w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem onClick={() => handleDVMenuSelect('dv-journal')}>Journal Entries</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDVMenuSelect('immediate-help')}>
                Immediate Help
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TabsTrigger
            value="help"
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight flex-1 min-w-[70px]"
          >
            Crime Help
          </TabsTrigger>
          <TabsTrigger
            value="install"
            className="text-[10px] xs:text-xs sm:text-sm px-1.5 xs:px-2 sm:px-3 py-2 sm:py-2.5 leading-tight flex-1 min-w-[70px]"
          >
            Install & Share
          </TabsTrigger>
        </TabsList>

        <TabsContent value="victim">
          <VictimProfile />
        </TabsContent>

        <TabsContent value="stalker">
          <StalkerRecord onPoliceDepartmentFound={setPoliceDepartment} />
        </TabsContent>

        <TabsContent value="report">
          <IncidentForm onIncidentCreated={handleIncidentCreated} />
        </TabsContent>

        <TabsContent value="history">
          <IncidentHistory selectedIncidentId={selectedIncidentId} />
        </TabsContent>

        <TabsContent value="evidence">
          <PoliceSubmissionHistory />
        </TabsContent>

        <TabsContent value="dv-journal">
          <DVJournalSection onNavigateToImmediateHelp={handleNavigateToImmediateHelp} />
        </TabsContent>

        <TabsContent value="immediate-help">
          <ImmediateHelpSafetyPlan />
        </TabsContent>

        <TabsContent value="help">
          <CrimeHelp />
        </TabsContent>

        <TabsContent value="install">
          <InstallationGuide />
        </TabsContent>
      </Tabs>
    </main>
  );
}
