import { currentUser } from "@clerk/nextjs/server";
import PublicNavbar from "@/components/PublicNavbar";
import PrivateNavbar from "@/components/PrivateNavbar"; 
export default async function MainLayout({
    children,
}:{
    children:React.ReactNode
}){
    const user = await currentUser();
    return(
        <main className="relative">
          {
            user ?
            (<><PrivateNavbar/></>):(<><PublicNavbar/></>)
          }
            {/* render child */}
            <section className="pt-36">
                {children}
            </section>
        </main>
    )
}