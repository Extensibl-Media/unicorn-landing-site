import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const AdminSettings = () => {
  return <Tabs defaultValue="account" className="flex flex-col md:flex-row gap-8">
    <TabsList className="flex md:flex-col">
      <TabsTrigger value="account">Account</TabsTrigger>
      <TabsTrigger value="password">Password</TabsTrigger>
    </TabsList>
  </Tabs>
}

export default AdminSettings