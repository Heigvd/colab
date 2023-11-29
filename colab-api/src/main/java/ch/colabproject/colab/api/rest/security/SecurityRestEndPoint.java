package ch.colabproject.colab.api.rest.security;

import ch.colabproject.colab.api.security.TosAndDataPolicy;

import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * REST SecurityRestEndpoint for ToS and Data Policy
 *
 * @author mikkelvestergaard
 */
@Path("security")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class SecurityRestEndPoint {

    /**
     * To get TosAndDataPolicy timestamp
     */
    @Inject
    private TosAndDataPolicy tosAndDataPolicy;

    @GET
    @Path("getTosAndDataPolicyTimeEpoch")
    public Long getTosAndDataPolicyTimeEpoch() { return tosAndDataPolicy.getEpochTime(); }
}
